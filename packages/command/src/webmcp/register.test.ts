import { afterEach, expect, mock, test } from "bun:test";
import type { AiTool } from "../ai/create-ai-tools";
import { type ModelContext, registerWebMcpTools } from "./register";

const tool = (name: string): AiTool => ({
  name,
  description: name,
  inputSchema: { type: "object", properties: {} },
  execute: async () => ({ ok: true }),
});

const mockModelContext = () => {
  const registerTool = mock<ModelContext["registerTool"]>(() => undefined);
  return { registerTool };
};

const globals = globalThis as { document?: unknown };

afterEach(() => {
  delete globals.document;
});

test("registers every tool with the signal", async () => {
  const modelContext = mockModelContext();
  const { signal } = new AbortController();
  const a = tool("a");
  const b = tool("b");

  expect(await registerWebMcpTools([a, b], { signal, modelContext })).toBe(
    true,
  );
  expect(modelContext.registerTool.mock.calls).toEqual([
    [a, { signal }],
    [b, { signal }],
  ]);
});

test("finds document.modelContext", async () => {
  const modelContext = mockModelContext();
  globals.document = { modelContext };

  expect(await registerWebMcpTools([tool("a")])).toBe(true);
  expect(modelContext.registerTool).toHaveBeenCalledTimes(1);
});

test("does nothing without WebMCP", async () => {
  globals.document = { modelContext: {} };
  expect(await registerWebMcpTools([tool("a")])).toBe(false);
});
