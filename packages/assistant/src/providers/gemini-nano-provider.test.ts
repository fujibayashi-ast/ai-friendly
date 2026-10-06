import { afterEach, describe, expect, mock, test } from "bun:test";
import type { AiTool } from "@ai-friendly/command";
import {
  createGeminiNanoProvider,
  fromNanoResponse,
  toNanoMessages,
  toResponseSchema,
  toSystemPrompt,
} from "./gemini-nano-provider";

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

const globals = globalThis as { LanguageModel?: unknown };
afterEach(() => {
  delete globals.LanguageModel;
});

describe("toSystemPrompt", () => {
  test("lists the tools after the site's system prompt", () => {
    const prompt = toSystemPrompt("Operate the site.", [tool]);
    expect(prompt.startsWith("Operate the site.\n\nTools:\n")).toBe(true);
    expect(prompt).toContain("- set_theme: Change the color theme.");
  });
});

describe("toResponseSchema", () => {
  test("limits calls to the tools and their input schemas", () => {
    expect(toResponseSchema([tool])).toEqual({
      type: "object",
      properties: {
        calls: {
          type: "array",
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
                  },
                },
                required: ["name", "input"],
              },
            ],
          },
        },
        reply: { type: "string" },
      },
      required: ["calls", "reply"],
    });
  });
});

describe("toNanoMessages", () => {
  test("turns tool calls into JSON and results into user messages", () => {
    expect(
      toNanoMessages([
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
          '{"calls":[{"name":"set_theme","input":{"theme":"dark"}},{"name":"set_language","input":{"language":"en"}}],"reply":""}',
      },
      {
        role: "user",
        content:
          'Result of set_theme: {"ok":true}\nResult of set_language: {"ok":false,"code":"rejected","message":"m"}',
      },
      { role: "assistant", content: '{"calls":[],"reply":"Done."}' },
    ]);
  });
});

describe("fromNanoResponse", () => {
  test("reads the reply and gives each call an id", () => {
    const reply = fromNanoResponse(
      '{"calls":[{"name":"set_theme","input":{"theme":"dark"}}],"reply":""}',
    );
    expect(reply.content).toBe("");
    expect(reply.toolCalls).toEqual([
      { id: expect.any(String), name: "set_theme", input: { theme: "dark" } },
    ]);
  });

  test("throws on text that is not JSON", () => {
    expect(() => fromNanoResponse("Sure!")).toThrow();
  });
});

describe("createGeminiNanoProvider", () => {
  test("prompts a new session with the constraint and destroys it", async () => {
    const destroy = mock(() => {});
    const prompt = mock(async () => '{"calls":[],"reply":"Hi"}');
    const create = mock(async () => ({ prompt, destroy }));
    globals.LanguageModel = { create };

    const reply = await createGeminiNanoProvider({ system: "S" }).complete({
      messages: [{ role: "user", content: "hello" }],
      tools: [tool],
    });

    expect(reply).toEqual({ content: "Hi", toolCalls: [] });
    expect(prompt).toHaveBeenCalledWith([{ role: "user", content: "hello" }], {
      responseConstraint: toResponseSchema([tool]),
    });
    expect(destroy).toHaveBeenCalled();
  });

  test("throws when the Prompt API is missing", async () => {
    await expect(
      createGeminiNanoProvider().complete({ messages: [], tools: [] }),
    ).rejects.toThrow();
  });
});
