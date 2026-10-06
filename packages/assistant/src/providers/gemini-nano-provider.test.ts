import { afterEach, describe, expect, mock, test } from "bun:test";
import type { AiTool } from "@ai-friendly/command";
import { createGeminiNanoProvider } from "./gemini-nano-provider";
import { toJsonToolsSchema } from "./json-tools";

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

describe("createGeminiNanoProvider", () => {
  test("prompts a new session with the constraint and destroys it", async () => {
    const destroy = mock(() => {});
    const prompt = mock(async () => '{"reply":"Hi"}');
    const create = mock(async () => ({ prompt, destroy }));
    globals.LanguageModel = { create };

    const reply = await createGeminiNanoProvider({ system: "S" }).complete({
      messages: [{ role: "user", content: "hello" }],
      tools: [tool],
    });

    expect(reply).toEqual({ content: "Hi", toolCalls: [] });
    expect(prompt).toHaveBeenCalledWith([{ role: "user", content: "hello" }], {
      responseConstraint: toJsonToolsSchema([tool]),
    });
    expect(destroy).toHaveBeenCalled();
  });

  test("throws when the Prompt API is missing", async () => {
    await expect(
      createGeminiNanoProvider().complete({ messages: [], tools: [] }),
    ).rejects.toThrow();
  });
});
