import { describe, expect, test } from "bun:test";
import type { AiTool } from "@ai-friendly/command";
import {
  fromJsonToolsReply,
  toJsonToolsMessages,
  toJsonToolsSchema,
  toJsonToolsSystemPrompt,
} from "./json-tools";
import { plainTextRule } from "./reply-format";

const tool: AiTool = {
  name: "set_theme",
  description: "Change the color theme.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { theme: { type: "string", enum: ["light", "dark"] } },
    required: ["theme"],
  },
  execute: async () => ({ ok: true }),
};

describe("toJsonToolsSystemPrompt", () => {
  test("lists the tools after the site's system prompt", () => {
    const prompt = toJsonToolsSystemPrompt("Operate the site.", [tool]);
    expect(prompt.startsWith("Operate the site.\n\nTools:\n")).toBe(true);
    expect(prompt).toContain("- set_theme: Change the color theme.");
    expect(prompt).toContain(plainTextRule);
  });
});

describe("toJsonToolsSchema", () => {
  test("allows either calls limited to the tools, or a reply", () => {
    expect(toJsonToolsSchema([tool])).toEqual({
      anyOf: [
        {
          type: "object",
          properties: {
            calls: {
              type: "array",
              minItems: 1,
              items: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      name: { type: "string", enum: ["set_theme"] },
                      input: {
                        type: "object",
                        properties: {
                          theme: { type: "string", enum: ["light", "dark"] },
                        },
                        required: ["theme"],
                        additionalProperties: false,
                      },
                    },
                    required: ["name", "input"],
                  },
                ],
              },
            },
          },
          required: ["calls"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: { reply: { type: "string" } },
          required: ["reply"],
          additionalProperties: false,
        },
      ],
    });
  });
});

describe("toJsonToolsMessages", () => {
  test("turns tool calls into JSON and results into user messages", () => {
    expect(
      toJsonToolsMessages([
        { role: "user", content: "dark and english" },
        {
          role: "assistant",
          content: "",
          toolCalls: [
            { id: "a", name: "set_theme", input: { theme: "dark" } },
            { id: "b", name: "set_language", input: { language: "en" } },
          ],
        },
        { role: "tool", toolCallId: "a", result: { ok: true } },
        {
          role: "tool",
          toolCallId: "b",
          result: { ok: false, code: "rejected", message: "m" },
        },
        { role: "assistant", content: "Done." },
      ]),
    ).toEqual([
      { role: "user", content: "dark and english" },
      {
        role: "assistant",
        content:
          '{"calls":[{"name":"set_theme","input":{"theme":"dark"}},{"name":"set_language","input":{"language":"en"}}]}',
      },
      {
        role: "user",
        content:
          'Result of set_theme: {"ok":true}\nResult of set_language: {"ok":false,"code":"rejected","message":"m"}',
      },
      { role: "assistant", content: '{"reply":"Done."}' },
    ]);
  });

  test("asks for a reply right after the tool results", () => {
    const messages = toJsonToolsMessages([
      { role: "user", content: "dark" },
      {
        role: "assistant",
        content: "",
        toolCalls: [{ id: "a", name: "set_theme", input: { theme: "dark" } }],
      },
      { role: "tool", toolCallId: "a", result: { ok: true } },
    ]);
    expect(messages.at(-1)).toEqual({
      role: "user",
      content:
        'Result of set_theme: {"ok":true}\nNow reply to the user in their language, unless another tool is still needed.',
    });
  });

  const lastAfter = (...results: unknown[]) =>
    toJsonToolsMessages([
      { role: "user", content: "add honey" },
      {
        role: "assistant",
        content: "",
        toolCalls: results.map((_, i) => ({
          id: String(i),
          name: "add_to_cart",
          input: {},
        })),
      },
      ...results.map((result, i) => ({
        role: "tool" as const,
        toolCallId: String(i),
        result,
      })),
    ])
      .at(-1)
      ?.content.split("\n")
      .at(-1);

  test("tells not to say a failed tool succeeded", () => {
    expect(
      lastAfter(
        { ok: true },
        { ok: false, code: "domain_error", message: "m" },
      ),
    ).toBe(
      'A tool failed (see "ok": false). Do not say it succeeded. Tell the user in their language what could not be done and why.',
    );
  });

  test("tells not to call a declined tool again", () => {
    expect(lastAfter({ ok: false, code: "rejected", message: "m" })).toBe(
      "The user declined. Do not call it again; tell the user in their language that it was not done.",
    );
  });

  test("looks only at the results after the last call", () => {
    const messages = toJsonToolsMessages([
      { role: "user", content: "a" },
      {
        role: "assistant",
        content: "",
        toolCalls: [{ id: "a", name: "add_to_cart", input: {} }],
      },
      {
        role: "tool",
        toolCallId: "a",
        result: { ok: false, code: "domain_error", message: "m" },
      },
      {
        role: "assistant",
        content: "",
        toolCalls: [{ id: "b", name: "add_to_cart", input: {} }],
      },
      { role: "tool", toolCallId: "b", result: { ok: true } },
    ]);
    expect(messages.at(-1)?.content.split("\n").at(-1)).toBe(
      "Now reply to the user in their language, unless another tool is still needed.",
    );
  });
});

describe("fromJsonToolsReply", () => {
  test("reads the reply and gives each call an id", () => {
    const reply = fromJsonToolsReply(
      '{"calls":[{"name":"set_theme","input":{"theme":"dark"}}]}',
    );
    expect(reply.content).toBe("");
    expect(reply.toolCalls).toEqual([
      { id: expect.any(String), name: "set_theme", input: { theme: "dark" } },
    ]);
  });

  test("throws on text that is not JSON", () => {
    expect(() => fromJsonToolsReply("Sure!")).toThrow();
  });
});
