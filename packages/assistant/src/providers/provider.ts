import type { AiTool } from "@ai-friendly/command";

/** `id` は会話の中で一意にする（結果をこの `id` で探すため） */
export type ToolCall = { id: string; name: string; input: unknown };

export type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; toolCalls?: readonly ToolCall[] }
  | { role: "tool"; toolCallId: string; result: unknown };

export type ProviderReply = {
  content: string;
  toolCalls?: readonly ToolCall[];
};

/**
 * チャットの裏で動く LLM。会話とツールを受け取り、返事かツールの呼び出しを返す
 * @see docs/assistant.md
 */
export type ChatProvider = {
  complete(request: {
    messages: readonly ChatMessage[];
    tools: readonly AiTool[];
  }): Promise<ProviderReply>;
};
