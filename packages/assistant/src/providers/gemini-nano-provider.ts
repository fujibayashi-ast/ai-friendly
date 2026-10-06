import type { AiTool } from "@ai-friendly/command";
import {
  getLanguageModel,
  type LanguageModelMessage,
  languageModelOptions,
} from "./language-model";
import type { ChatMessage, ChatProvider, ProviderReply } from "./provider";

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
          { role: "system", content: toSystemPrompt(system, tools) },
        ],
      });
      try {
        const text = await session.prompt(toNanoMessages(messages), {
          responseConstraint: toResponseSchema(tools),
        });
        return fromNanoResponse(text);
      } finally {
        session.destroy();
      }
    },
  };
}

export function toSystemPrompt(
  system: string | undefined,
  tools: readonly AiTool[],
): string {
  return [
    ...(system ? [system, ""] : []),
    "Tools:",
    ...tools.map((tool) => `- ${tool.name}: ${tool.description}`),
    "",
    'Answer in JSON: {"calls": [{"name": "<tool>", "input": {...}}], "reply": "<text>"}.',
    '- To use tools, put them in "calls" and leave "reply" empty. You will get the results as "Result of <tool>: ...".',
    '- When no tool is needed, or after you get the results, return "calls": [] and write "reply".',
  ].join("\n");
}

/** 返事の形: 呼び出し（ツールごとの引数のスキーマに縛る）と返事の文 */
export function toResponseSchema(
  tools: readonly AiTool[],
): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      calls: {
        type: "array",
        items: {
          anyOf: tools.map((tool) => {
            const { $schema: _, ...input } = tool.inputSchema;
            return {
              type: "object",
              properties: {
                name: { type: "string", enum: [tool.name] },
                input,
              },
              required: ["name", "input"],
            };
          }),
        },
      },
      reply: { type: "string" },
    },
    required: ["calls", "reply"],
  };
}

/** Prompt API にはツールの役がないので、呼び出しは返事の JSON に、結果は user の発言にする */
export function toNanoMessages(
  messages: readonly ChatMessage[],
): LanguageModelMessage[] {
  const names = new Map<string, string>();
  const result: LanguageModelMessage[] = [];
  const push = (role: "user" | "assistant", content: string) => {
    // 同じ役が続いたら 1 つにまとめる（ツールの結果が続くときなど）
    const last = result.at(-1);
    if (last?.role === role) last.content += `\n${content}`;
    else result.push({ role, content });
  };
  for (const message of messages) {
    if (message.role === "user") {
      push("user", message.content);
    } else if (message.role === "assistant") {
      const calls = (message.toolCalls ?? []).map((call) => {
        names.set(call.id, call.name);
        return { name: call.name, input: call.input };
      });
      push("assistant", JSON.stringify({ calls, reply: message.content }));
    } else {
      const name = names.get(message.toolCallId) ?? "tool";
      push("user", `Result of ${name}: ${JSON.stringify(message.result)}`);
    }
  }
  return result;
}

export function fromNanoResponse(text: string): ProviderReply {
  const body: unknown = JSON.parse(text);
  if (typeof body !== "object" || body === null) {
    throw new Error("Gemini Nano: unexpected response");
  }
  const reply =
    "reply" in body && typeof body.reply === "string" ? body.reply : "";
  const calls = "calls" in body && Array.isArray(body.calls) ? body.calls : [];
  return {
    content: reply,
    toolCalls: calls.flatMap((call: unknown) =>
      typeof call === "object" &&
      call !== null &&
      "name" in call &&
      typeof call.name === "string"
        ? [
            {
              id: crypto.randomUUID(),
              name: call.name,
              input: "input" in call ? call.input : {},
            },
          ]
        : [],
    ),
  };
}
