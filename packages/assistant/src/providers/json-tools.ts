// ツールの呼び出しの仕組みがない LLM（Gemini Nano・WebLLM）向けに、ツールの呼び出しを JSON の返事で受け取る
// 返事は `{ calls }` か `{ reply }` のどちらか。形は JSON Schema で縛る

import type { AiTool } from "@ai-friendly/command";
import type { ChatMessage, ProviderReply } from "./provider";

export type JsonToolsMessage = {
  role: "user" | "assistant";
  content: string;
};

export function toJsonToolsSystemPrompt(
  system: string | undefined,
  tools: readonly AiTool[],
): string {
  return [
    ...(system ? [system, ""] : []),
    "Tools:",
    ...tools.map((tool) => `- ${tool.name}: ${tool.description}`),
    "",
    "Answer in JSON, in one of two forms:",
    '- To use tools: {"calls": [{"name": "<tool>", "input": {...}}]}. You will get the results as "Result of <tool>: ...".',
    '- To reply to the user: {"reply": "<text>"}.',
    "Do not call a tool again for a request that already succeeded.",
  ].join("\n");
}

/**
 * 返事の形: ツールの呼び出し（ツールごとの引数のスキーマに縛る）か返事の文の、どちらか一方
 * 両方を持てると、小さいモデルは実行前に「変えました」と返事を書いてしまう
 */
export function toJsonToolsSchema(
  tools: readonly AiTool[],
): Record<string, unknown> {
  const calls = {
    type: "object",
    properties: {
      calls: {
        type: "array",
        minItems: 1,
        items: {
          anyOf: tools.map((tool) => {
            // 知らない項目は検証で失敗するので、出せないようにする（"confirm": true などを足しがち）
            const { $schema: _, ...schema } = tool.inputSchema;
            const input = { ...schema, additionalProperties: false };
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
    },
    required: ["calls"],
    additionalProperties: false,
  };
  const reply = {
    type: "object",
    properties: { reply: { type: "string" } },
    required: ["reply"],
    additionalProperties: false,
  };
  return { anyOf: [calls, reply] };
}

// 結果を見た後に同じツールを呼び直さないよう、結果のすぐ後で返事を促す
const afterResults =
  "Now reply to the user in their language, unless another tool is still needed.";

/** ツールの役がない LLM 向けに、呼び出しは返事の JSON に、結果は user の発言にする */
export function toJsonToolsMessages(
  messages: readonly ChatMessage[],
): JsonToolsMessage[] {
  const names = new Map<string, string>();
  const result: JsonToolsMessage[] = [];
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
      // 返事の形に合わせて、呼び出しがあれば呼び出しだけにする（Claude の会話を引き継いだときなど）
      push(
        "assistant",
        JSON.stringify(
          calls.length > 0 ? { calls } : { reply: message.content },
        ),
      );
    } else {
      const name = names.get(message.toolCallId) ?? "tool";
      push("user", `Result of ${name}: ${JSON.stringify(message.result)}`);
    }
  }
  const last = result.at(-1);
  if (last && messages.at(-1)?.role === "tool") {
    last.content += `\n${afterResults}`;
  }
  return result;
}

export function fromJsonToolsReply(text: string): ProviderReply {
  const body: unknown = JSON.parse(text);
  if (typeof body !== "object" || body === null) {
    throw new Error("unexpected response");
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
