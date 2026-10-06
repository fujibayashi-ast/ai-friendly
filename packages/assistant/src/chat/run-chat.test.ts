import { describe, expect, mock, test } from "bun:test";
import type { AiTool } from "@ai-friendly/command";
import type {
  ChatMessage,
  ChatProvider,
  ProviderReply,
} from "../providers/provider";
import { runChat } from "./run-chat";

const tool = (name: string, execute: AiTool["execute"]): AiTool => ({
  name,
  description: name,
  inputSchema: { type: "object", properties: {} },
  execute,
});

const replies = (...list: ProviderReply[]): ChatProvider => {
  const queue = [...list];
  return {
    complete: mock(async () => queue.shift() ?? { content: "end" }),
  };
};

describe("runChat", () => {
  test("runs tool calls and returns the results to the provider", async () => {
    const setTheme = mock(async () => ({ ok: true }));
    const provider = replies(
      {
        content: "",
        toolCalls: [{ id: "1", name: "set_theme", input: { theme: "dark" } }],
      },
      { content: "Done" },
    );
    const received: ChatMessage[] = [];

    const result = await runChat({
      provider,
      messages: [{ role: "user", content: "dark" }],
      getTools: () => [tool("set_theme", setTheme)],
      onMessage: (m) => received.push(m),
    });

    expect(result).toBe("done");
    expect(setTheme).toHaveBeenCalledWith({ theme: "dark" });
    expect(received).toEqual([
      {
        role: "assistant",
        content: "",
        toolCalls: [{ id: "1", name: "set_theme", input: { theme: "dark" } }],
      },
      { role: "tool", toolCallId: "1", result: { ok: true } },
      { role: "assistant", content: "Done" },
    ]);
    expect(provider.complete).toHaveBeenLastCalledWith({
      messages: [{ role: "user", content: "dark" }, ...received.slice(0, 2)],
      tools: expect.any(Array),
    });
  });

  test("reads the latest tools at every step", async () => {
    let theme = "light";
    const getTools = () => [
      tool("set_theme", async () => {
        theme = "dark";
        return { ok: true };
      }),
      tool("get_state", async () => ({ theme })),
    ];
    const received: ChatMessage[] = [];
    await runChat({
      provider: replies(
        { content: "", toolCalls: [{ id: "1", name: "set_theme", input: {} }] },
        { content: "", toolCalls: [{ id: "2", name: "get_state", input: {} }] },
      ),
      messages: [],
      getTools,
      onMessage: (m) => received.push(m),
    });
    expect(received.at(-2)).toEqual({
      role: "tool",
      toolCallId: "2",
      result: { theme: "dark" },
    });
  });

  test("returns an error result for an unknown tool", async () => {
    const received: ChatMessage[] = [];
    await runChat({
      provider: replies({
        content: "",
        toolCalls: [{ id: "1", name: "set_color", input: {} }],
      }),
      messages: [],
      getTools: () => [tool("set_theme", async () => ({ ok: true }))],
      onMessage: (m) => received.push(m),
    });
    expect(received[1]).toEqual({
      role: "tool",
      toolCallId: "1",
      result: {
        ok: false,
        code: "invalid_command",
        message: 'unknown tool "set_color" (available: set_theme)',
      },
    });
  });

  test("stops after maxSteps", async () => {
    const provider: ChatProvider = {
      complete: async () => ({
        content: "",
        toolCalls: [{ id: "1", name: "noop", input: {} }],
      }),
    };
    const result = await runChat({
      provider,
      messages: [],
      getTools: () => [tool("noop", async () => ({ ok: true }))],
      onMessage: () => {},
      maxSteps: 3,
    });
    expect(result).toBe("too_many_steps");
  });
});
