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
  expect(
    modelContext.registerTool.mock.calls.map(([t, options]) => [
      t.name,
      options,
    ]),
  ).toEqual([
    ["a", { signal }],
    ["b", { signal }],
  ]);
});

test("passes the input to execute, not the WebMCP client", async () => {
  const modelContext = mockModelContext();
  const execute = mock<AiTool["execute"]>(async () => ({ ok: true }));
  await registerWebMcpTools([{ ...tool("a"), execute }], { modelContext });
  const registered = modelContext.registerTool.mock.calls[0]?.[0];
  await registered?.execute({ x: 1 }, { requestUserInteraction() {} } as never);
  expect(execute.mock.calls).toEqual([[{ x: 1 }, { pointer: undefined }]]);
});

test("passes the pointer to execute, like the chat", async () => {
  const modelContext = mockModelContext();
  const execute = mock<AiTool["execute"]>(async () => ({ ok: true }));
  const pointer = { click: async () => {}, type: async () => {} };
  await registerWebMcpTools([{ ...tool("a"), execute }], {
    modelContext,
    pointer,
  });
  const registered = modelContext.registerTool.mock.calls[0]?.[0];
  await registered?.execute({ x: 1 }, { requestUserInteraction() {} } as never);
  expect(execute.mock.calls).toEqual([[{ x: 1 }, { pointer }]]);
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

test("stops without throwing when aborted while registering", async () => {
  const controller = new AbortController();
  const registerTool = mock<ModelContext["registerTool"]>(async () => {
    controller.abort();
    throw new DOMException("signal is aborted without reason", "AbortError");
  });

  expect(
    await registerWebMcpTools([tool("a"), tool("b")], {
      signal: controller.signal,
      modelContext: { registerTool },
    }),
  ).toBe(false);
  expect(registerTool).toHaveBeenCalledTimes(1);
});

test("registers nothing when already aborted", async () => {
  const modelContext = mockModelContext();
  expect(
    await registerWebMcpTools([tool("a")], {
      signal: AbortSignal.abort(),
      modelContext,
    }),
  ).toBe(false);
  expect(modelContext.registerTool).not.toHaveBeenCalled();
});

test("throws errors other than abort", async () => {
  const registerTool = mock<ModelContext["registerTool"]>(async () => {
    throw new Error("duplicate tool name");
  });
  await expect(
    registerWebMcpTools([tool("a")], { modelContext: { registerTool } }),
  ).rejects.toThrow("duplicate tool name");
});
