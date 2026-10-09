import { afterEach, describe, expect, mock, test } from "bun:test";
import type { AiTool } from "@ai-friendly/command";
import {
  createClaudeProvider,
  fromClaudeResponse,
  toClaudeMessages,
} from "./claude-provider";
import { ProviderAuthError } from "./provider";
import { plainTextRule } from "./reply-format";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

const mockFetch = (status: number, body: unknown) => {
  const fn = mock(async () => new Response(JSON.stringify(body), { status }));
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
};

const tool: AiTool = {
  name: "set_theme",
  description: "Change the color theme.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { theme: { type: "string" } },
  },
  execute: async () => ({ ok: true }),
};

describe("toClaudeMessages", () => {
  test("converts tool calls and groups consecutive tool results", () => {
    expect(
      toClaudeMessages([
        { role: "user", content: "dark and english" },
        {
          role: "assistant",
          content: "Sure.",
          toolCalls: [
            { id: "a", name: "set_theme", input: { theme: "dark" } },
            { id: "b", name: "set_language", input: { language: "en" } },
          ],
        },
        { role: "tool", toolCallId: "a", result: { ok: true } },
        {
          role: "tool",
          toolCallId: "b",
          result: { ok: false, code: "rejected", message: "m" },
        },
        { role: "assistant", content: "Done." },
      ]),
    ).toEqual([
      { role: "user", content: "dark and english" },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Sure." },
          {
            type: "tool_use",
            id: "a",
            name: "set_theme",
            input: { theme: "dark" },
          },
          {
            type: "tool_use",
            id: "b",
            name: "set_language",
            input: { language: "en" },
          },
        ],
      },
      {
        role: "user",
        content: [
          { type: "tool_result", tool_use_id: "a", content: '{"ok":true}' },
          {
            type: "tool_result",
            tool_use_id: "b",
            content: '{"ok":false,"code":"rejected","message":"m"}',
            is_error: true,
          },
        ],
      },
      { role: "assistant", content: [{ type: "text", text: "Done." }] },
    ]);
  });

  test("merges consecutive user messages", () => {
    expect(
      toClaudeMessages([
        { role: "user", content: "dark" },
        { role: "user", content: "dark please" },
      ]),
    ).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "dark" },
          { type: "text", text: "dark please" },
        ],
      },
    ]);
  });

  test("drops an empty assistant message", () => {
    expect(
      toClaudeMessages([
        { role: "user", content: "hi" },
        { role: "assistant", content: "" },
      ]),
    ).toEqual([{ role: "user", content: "hi" }]);
  });
});

describe("fromClaudeResponse", () => {
  test("reads text and tool calls", () => {
    expect(
      fromClaudeResponse({
        content: [
          { type: "text", text: "Switching." },
          {
            type: "tool_use",
            id: "t1",
            name: "set_theme",
            input: { theme: "dark" },
          },
        ],
      }),
    ).toEqual({
      content: "Switching.",
      toolCalls: [{ id: "t1", name: "set_theme", input: { theme: "dark" } }],
    });
  });
});

describe("createClaudeProvider", () => {
  test("tells Claude to reply in plain text even without a site prompt", async () => {
    const fetch = mockFetch(200, { content: [{ type: "text", text: "Hi" }] });
    await createClaudeProvider({ apiKey: "sk-test" }).complete({
      messages: [{ role: "user", content: "hello" }],
      tools: [],
    });
    const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body)).system).toBe(plainTextRule);
  });

  test("sends the request with the API key and tools", async () => {
    const fetch = mockFetch(200, { content: [{ type: "text", text: "Hi" }] });
    const provider = createClaudeProvider({ apiKey: "sk-test", system: "S" });
    const reply = await provider.complete({
      messages: [{ role: "user", content: "hello" }],
      tools: [tool],
    });
    expect(reply).toEqual({ content: "Hi", toolCalls: [] });

    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers).toMatchObject({
      "x-api-key": "sk-test",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: `S\n\n${plainTextRule}`,
      tools: [
        {
          name: "set_theme",
          description: "Change the color theme.",
          input_schema: {
            type: "object",
            properties: { theme: { type: "string" } },
          },
        },
      ],
      messages: [{ role: "user", content: "hello" }],
    });
  });

  test("throws an auth error for 401", async () => {
    mockFetch(401, { type: "error" });
    const provider = createClaudeProvider({ apiKey: "bad" });
    await expect(
      provider.complete({ messages: [], tools: [] }),
    ).rejects.toBeInstanceOf(ProviderAuthError);
  });
});
