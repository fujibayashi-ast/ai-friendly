import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import {
  fromJsonToolsReply,
  toJsonToolsMessages,
  toJsonToolsSchema,
  toJsonToolsSystemPrompt,
} from "./json-tools";
import type { ChatProvider } from "./provider";

export type WebLlmProviderOptions = {
  /** 読み込み済みの WebLLM のエンジン */
  engine: Pick<MLCEngineInterface, "chat">;
  system?: string;
};

/**
 * WebLLM（WebGPU）でブラウザの中の LLM を使うプロバイダ。API キーもサーバーも要らない
 * ツールの呼び出しは、返事の形を JSON Schema（`response_format`）で決めて受け取る
 * エンジンの読み込みは `useQwen` で行う
 *
 * @see docs/assistant.md
 */
export function createWebLlmProvider({
  engine,
  system,
}: WebLlmProviderOptions): ChatProvider {
  return {
    async complete({ messages, tools }) {
      const reply = await engine.chat.completions.create({
        messages: [
          { role: "system", content: toJsonToolsSystemPrompt(system, tools) },
          ...toJsonToolsMessages(messages),
        ],
        response_format: {
          type: "json_object",
          schema: JSON.stringify(toJsonToolsSchema(tools)),
        },
        // Qwen3.5 の思考モードを止める（考え始めると遅い）
        extra_body: { enable_thinking: false },
        stream: false,
        // ばらつかせると、返事の日本語にほかの言語の単語が混ざる
        temperature: 0,
      });
      return fromJsonToolsReply(
        withoutThinking(reply.choices[0]?.message.content ?? ""),
      );
    },
  };
}

// Qwen3.5 は思考モードを止めても、JSON の前に空の <think></think> を書く
function withoutThinking(text: string): string {
  return text.replace(/^\s*<think>[\s\S]*?<\/think>\s*/, "");
}
