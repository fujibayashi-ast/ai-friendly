import { isFailure } from "../conversation/tool-result";
import { type ChatLanguage, createTranslate } from "../i18n/messages";
import type { ChatProvider, ToolCall } from "./provider";

/** 入力が `pattern` に合ったら `tool` を `input` で呼ぶ */
export type ScriptedRule = {
  pattern: RegExp;
  tool: string;
  input?: Record<string, unknown>;
};

export type ScriptedProviderOptions = {
  rules: readonly ScriptedRule[];
  language: ChatLanguage;
};

/**
 * 通信しない仮のボット。決まった言い回しに合うツールを呼び、結果を見て短く返事する
 * 本物の LLM をつなぐまでの、画面と流れの確認用
 * @see docs/assistant.md
 */
export function createScriptedProvider({
  rules,
  language,
}: ScriptedProviderOptions): ChatProvider {
  const t = createTranslate(language);

  return {
    async complete({ messages }) {
      const last = messages.at(-1);
      if (last?.role === "tool") {
        const results = [];
        for (const message of [...messages].reverse()) {
          if (message.role !== "tool") break;
          results.push(message.result);
        }
        const failed = results.some(isFailure);
        return { content: t(failed ? "scripted.failed" : "scripted.done") };
      }

      const text = last?.role === "user" ? last.content : "";
      const toolCalls: ToolCall[] = rules
        .filter((rule) => rule.pattern.test(text))
        .map((rule) => ({
          id: crypto.randomUUID(),
          name: rule.tool,
          input: rule.input ?? {},
        }));
      return toolCalls.length > 0
        ? { content: "", toolCalls }
        : { content: t("scripted.fallback") };
    },
  };
}
