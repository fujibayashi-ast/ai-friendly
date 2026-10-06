import {
  fromJsonToolsReply,
  toJsonToolsMessages,
  toJsonToolsSchema,
  toJsonToolsSystemPrompt,
} from "./json-tools";
import { getLanguageModel, languageModelOptions } from "./language-model";
import type { ChatProvider } from "./provider";

export type GeminiNanoProviderOptions = {
  system?: string;
};

/**
 * Chrome に入っている Gemini Nano（Prompt API）を使うプロバイダ。API キーもサーバーも要らない
 * ツールの呼び出しは、返事の形を JSON Schema（`responseConstraint`）で決めて受け取る
 * 使えるか・ダウンロードは `useGeminiNano` で確かめてから使う
 *
 * @see docs/assistant.md
 */
export function createGeminiNanoProvider({
  system,
}: GeminiNanoProviderOptions = {}): ChatProvider {
  return {
    async complete({ messages, tools }) {
      const LanguageModel = getLanguageModel();
      if (!LanguageModel) throw new Error("Prompt API is not available");
      // 会話は毎回まるごと渡ってくるので、セッションは持ち越さない
      const session = await LanguageModel.create({
        ...languageModelOptions,
        initialPrompts: [
          { role: "system", content: toJsonToolsSystemPrompt(system, tools) },
        ],
      });
      try {
        const text = await session.prompt(toJsonToolsMessages(messages), {
          responseConstraint: toJsonToolsSchema(tools),
        });
        return fromJsonToolsReply(text);
      } finally {
        session.destroy();
      }
    },
  };
}
