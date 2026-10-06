import { describe, expect, test } from "bun:test";
import type { ChatMessage } from "./provider";
import { createScriptedProvider } from "./scripted-provider";

const provider = createScriptedProvider({
  language: "ja",
  rules: [
    { pattern: /ダーク|dark/i, tool: "set_theme", input: { theme: "dark" } },
    { pattern: /英語/, tool: "set_language", input: { language: "en" } },
  ],
});
const complete = (messages: ChatMessage[]) =>
  provider.complete({ messages, tools: [] });

describe("createScriptedProvider", () => {
  test("calls every matching tool", async () => {
    const reply = await complete([
      { role: "user", content: "英語にしてダークにして" },
    ]);
    expect(reply.toolCalls?.map((c) => [c.name, c.input])).toEqual([
      ["set_theme", { theme: "dark" }],
      ["set_language", { language: "en" }],
    ]);
  });

  test("replies after the tool results", async () => {
    const call = { id: "1", name: "set_theme", input: {} };
    const assistant: ChatMessage = {
      role: "assistant",
      content: "",
      toolCalls: [call],
    };
    expect(
      await complete([
        assistant,
        { role: "tool", toolCallId: "1", result: { ok: true } },
      ]),
    ).toEqual({ content: "実行しました。" });
    expect(
      await complete([
        assistant,
        {
          role: "tool",
          toolCallId: "1",
          result: { ok: false, code: "rejected", message: "m" },
        },
      ]),
    ).toEqual({ content: "うまくいきませんでした。" });
  });

  test("explains itself when nothing matches", async () => {
    const reply = await complete([{ role: "user", content: "こんにちは" }]);
    expect(reply.toolCalls).toBeUndefined();
    expect(reply.content).toContain("決まった言い回し");
  });
});
