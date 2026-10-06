import type { AiTool } from "@ai-friendly/command";
import { isFailure } from "../conversation/tool-result";
import {
  type ChatMessage,
  type ChatProvider,
  ProviderAuthError,
  type ProviderReply,
} from "./provider";

export type ClaudeProviderOptions = {
  apiKey: string;
  /** 既定は `claude-haiku-4-5` */
  model?: string;
  system?: string;
};

type ClaudeBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | {
      type: "tool_result";
      tool_use_id: string;
      content: string;
      is_error?: boolean;
    };

type ClaudeMessage = {
  role: "user" | "assistant";
  content: string | ClaudeBlock[];
};

/**
 * ブラウザから Claude API（Messages API）を直接呼ぶプロバイダ
 * API キーはユーザーが入力したものを使う。サーバーを通さないため、公開するサイトでは利用者自身のキーを使う前提
 *
 * @example
 * const provider = createClaudeProvider({ apiKey, system: "You operate this website with the tools." });
 * @see docs/assistant.md
 */
export function createClaudeProvider({
  apiKey,
  model = "claude-haiku-4-5",
  system,
}: ClaudeProviderOptions): ChatProvider {
  return {
    async complete({ messages, tools }) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          ...(system && { system }),
          tools: tools.map(toClaudeTool),
          messages: toClaudeMessages(messages),
        }),
      });
      if (response.status === 401) {
        throw new ProviderAuthError("Claude API: invalid API key");
      }
      if (!response.ok) {
        throw new Error(`Claude API: ${response.status}`);
      }
      return fromClaudeResponse(await response.json());
    },
  };
}

function toClaudeTool(tool: AiTool) {
  // Claude は JSON Schema の $schema を使わないので外す
  const { $schema: _, ...inputSchema } = tool.inputSchema;
  return {
    name: tool.name,
    description: tool.description,
    input_schema: inputSchema,
  };
}

export function toClaudeMessages(
  messages: readonly ChatMessage[],
): ClaudeMessage[] {
  const result: ClaudeMessage[] = [];
  for (const message of messages) {
    if (message.role === "user") {
      // 返事を受け取れなかったターンの後などは、user が続くので 1 つにまとめる
      const last = result.at(-1);
      if (last?.role === "user") {
        last.content = [
          ...toBlocks(last.content),
          { type: "text", text: message.content },
        ];
      } else {
        result.push({ role: "user", content: message.content });
      }
      continue;
    }
    if (message.role === "assistant") {
      const content: ClaudeBlock[] = [
        ...(message.content
          ? [{ type: "text" as const, text: message.content }]
          : []),
        ...(message.toolCalls ?? []).map((call) => ({
          type: "tool_use" as const,
          id: call.id,
          name: call.name,
          input: call.input,
        })),
      ];
      if (content.length > 0) result.push({ role: "assistant", content });
      continue;
    }
    // 続くツールの結果は 1 つの user メッセージにまとめる
    const block: ClaudeBlock = {
      type: "tool_result",
      tool_use_id: message.toolCallId,
      content: JSON.stringify(message.result) ?? "null",
      ...(isFailure(message.result) && { is_error: true }),
    };
    const last = result.at(-1);
    if (
      last?.role === "user" &&
      Array.isArray(last.content) &&
      last.content.every((b) => b.type === "tool_result")
    ) {
      last.content.push(block);
    } else {
      result.push({ role: "user", content: [block] });
    }
  }
  return result;
}

function toBlocks(content: string | ClaudeBlock[]): ClaudeBlock[] {
  return typeof content === "string"
    ? [{ type: "text", text: content }]
    : content;
}

export function fromClaudeResponse(body: unknown): ProviderReply {
  const content =
    typeof body === "object" && body !== null && "content" in body
      ? (body.content as ClaudeBlock[])
      : [];
  return {
    content: content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n"),
    toolCalls: content.flatMap((block) =>
      block.type === "tool_use"
        ? [{ id: block.id, name: block.name, input: block.input }]
        : [],
    ),
  };
}
