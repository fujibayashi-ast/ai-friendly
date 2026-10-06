import { describe, expect, mock, test } from "bun:test";
import type { AiTool } from "@ai-friendly/command";
import { toJsonToolsSchema } from "./json-tools";
import {
  createWebLlmProvider,
  type WebLlmProviderOptions,
} from "./web-llm-provider";

const tool: AiTool = {
  name: "set_theme",
  description: "Change the color theme.",
  inputSchema: {
    type: "object",
    properties: { theme: { type: "string", enum: ["light", "dark"] } },
    required: ["theme"],
  },
  execute: async () => ({ ok: true }),
};

describe("createWebLlmProvider", () => {
  test("asks for JSON in the shape of the tools and skips the empty thinking", async () => {
    const create = mock(async () => ({
      choices: [
        {
          message: {
            content:
              '<think>\n\n</think>\n\n{"calls":[{"name":"set_theme","input":{"theme":"dark"}}]}',
          },
        },
      ],
    }));
    const engine = {
      chat: { completions: { create } },
    } as unknown as WebLlmProviderOptions["engine"];

    const reply = await createWebLlmProvider({ engine, system: "S" }).complete({
      messages: [{ role: "user", content: "dark" }],
      tools: [tool],
    });

    expect(reply.toolCalls).toEqual([
      { id: expect.any(String), name: "set_theme", input: { theme: "dark" } },
    ]);
    const [request] = create.mock.calls[0] as unknown as [
      Record<string, unknown>,
    ];
    expect(request.messages).toEqual([
      { role: "system", content: expect.stringContaining("S\n\nTools:") },
      { role: "user", content: "dark" },
    ]);
    expect(request.response_format).toEqual({
      type: "json_object",
      schema: JSON.stringify(toJsonToolsSchema([tool])),
    });
    expect(request.extra_body).toEqual({ enable_thinking: false });
  });
});
