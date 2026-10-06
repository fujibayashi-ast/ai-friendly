import type { ChatEntry } from "./use-chat";

// ツールの結果は、AI のメッセージの直後に続く tool メッセージから探す
// （ローカル LLM などは、ターンをまたいで同じ ID を使うことがあるため）
export function resultsAfter(
  messages: readonly ChatEntry[],
  index: number,
): ReadonlyMap<string, unknown> {
  const results = new Map<string, unknown>();
  for (const message of messages.slice(index + 1)) {
    if (message.role !== "tool") break;
    results.set(message.toolCallId, message.result);
  }
  return results;
}
