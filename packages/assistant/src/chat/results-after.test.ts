import { expect, test } from "bun:test";
import type { ChatMessage } from "../providers/provider";
import { resultsAfter } from "./results-after";

test("finds results only in the tool messages right after the message", () => {
  const call = { id: "call_0", name: "set_theme", input: {} };
  const messages: ChatMessage[] = [
    { role: "assistant", content: "", toolCalls: [call] },
    { role: "tool", toolCallId: "call_0", result: { ok: true } },
    { role: "assistant", content: "Done" },
    { role: "user", content: "again" },
    { role: "assistant", content: "", toolCalls: [call] },
    { role: "tool", toolCallId: "call_0", result: { ok: false } },
  ];
  expect(resultsAfter(messages, 0).get("call_0")).toEqual({ ok: true });
  expect(resultsAfter(messages, 4).get("call_0")).toEqual({ ok: false });
  expect(resultsAfter(messages, 2).size).toBe(0);
});
