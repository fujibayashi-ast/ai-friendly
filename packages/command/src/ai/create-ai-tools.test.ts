import { describe, expect, mock, test } from "bun:test";
import { z } from "zod";
import { createTodoCommands } from "../__fixtures__/todo-commands";
import { defineCommand } from "../define-command";
import type { ConfirmHandler } from "../types";
import { createAiTools } from "./create-ai-tools";

const setup = (confirm?: ConfirmHandler) => {
  const { todos, commands } = createTodoCommands();
  const tools = createAiTools({
    commands,
    confirm,
    getState: () => todos.map(({ id, title, done }) => ({ id, title, done })),
  });
  const byName = (name: string) => {
    const tool = tools.find((t) => t.name === name);
    if (!tool) throw new Error(`no tool ${name}`);
    return tool;
  };
  return { todos, tools, byName };
};

describe("command tools", () => {
  test("has one tool per command with a JSON Schema", () => {
    const { tools, byName } = setup();
    expect(tools.map((t) => t.name)).toEqual([
      "add_todo",
      "delete_todo",
      "complete_todo",
      "set_priority",
      "get_state",
    ]);
    expect(byName("add_todo").inputSchema).toMatchObject({
      type: "object",
      properties: { id: { type: "string" }, title: { type: "string" } },
      required: ["id", "title"],
    });
    expect(byName("delete_todo").description).toBe(
      "Delete a todo [may ask the user to confirm]",
    );
  });

  test("runs the command with validated arguments", async () => {
    const { todos, byName } = setup();
    expect(await byName("add_todo").execute({ id: "1", title: "a" })).toEqual({
      ok: true,
    });
    expect(await byName("complete_todo").execute({ id: "1" })).toEqual({
      ok: true,
    });
    expect(todos).toEqual([{ id: "1", title: "a", done: true, tags: [] }]);
  });

  test("returns validation errors without running", async () => {
    const { todos, byName } = setup();
    expect(await byName("add_todo").execute({ id: "1" })).toEqual({
      ok: false,
      code: "invalid_command",
      message: 'input: missing required field "title" in add_todo',
    });
    expect(todos).toEqual([]);
  });

  test("returns domain errors from run", async () => {
    const { byName } = setup();
    await byName("add_todo").execute({ id: "1", title: "a" });
    expect(await byName("add_todo").execute({ id: "1", title: "b" })).toEqual({
      ok: false,
      code: "domain_error",
      message: 'add_todo: todo "1" already exists',
    });
  });
});

describe("confirmation", () => {
  test("asks with the command before running", async () => {
    const confirm = mock(() => true);
    const { todos, byName } = setup(confirm);
    await byName("add_todo").execute({ id: "1", title: "a" });
    expect(await byName("delete_todo").execute({ id: "1" })).toEqual({
      ok: true,
    });
    expect(confirm).toHaveBeenCalledWith({ type: "delete_todo", id: "1" });
    expect(todos).toEqual([]);
  });

  test("rejects when the user declines or no handler is set", async () => {
    for (const confirm of [async () => false, undefined]) {
      const { todos, byName } = setup(confirm);
      await byName("add_todo").execute({ id: "1", title: "a" });
      expect(await byName("delete_todo").execute({ id: "1" })).toEqual({
        ok: false,
        code: "rejected",
        message: "delete_todo: rejected by the user",
      });
      expect(todos).toHaveLength(1);
    }
  });

  test("uses a rule function with the arguments", async () => {
    const confirm = mock(() => true);
    const { byName } = setup(confirm);
    await byName("add_todo").execute({ id: "1", title: "done" });
    await byName("complete_todo").execute({ id: "1" });
    await byName("delete_todo").execute({ id: "1" });
    expect(confirm).not.toHaveBeenCalled();
  });

  test("validates before asking", async () => {
    const confirm = mock(() => true);
    const { byName } = setup(confirm);
    expect(await byName("delete_todo").execute({})).toMatchObject({
      code: "invalid_command",
    });
    expect(confirm).not.toHaveBeenCalled();
  });
});

describe("get_state", () => {
  test("returns the state and is read-only", async () => {
    const { byName } = setup();
    await byName("add_todo").execute({ id: "1", title: "a" });
    const tool = byName("get_state");
    expect(tool.annotations).toEqual({ readOnlyHint: true });
    expect(await tool.execute(undefined)).toEqual([
      { id: "1", title: "a", done: false },
    ]);
  });

  test("is not created without getState", () => {
    const { commands } = createTodoCommands();
    const tools = createAiTools({ commands });
    expect(tools.map((t) => t.name)).not.toContain("get_state");
  });
});

describe("types", () => {
  test("infers run arguments from args", () => {
    defineCommand({
      type: "rename",
      description: "Rename",
      args: z.object({ name: z.string(), count: z.number().default(1) }),
      run(args) {
        const name: string = args.name;
        const count: number = args.count;
        // @ts-expect-error unknown field
        void args.title;
        void [name, count];
      },
      requiresConfirmation: (args) => args.name === "",
    });
  });
});
