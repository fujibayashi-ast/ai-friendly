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

  test("returns the message of a success from run", async () => {
    const [tool] = createAiTools({
      commands: [
        defineCommand({
          type: "fill_form",
          description: "Fill",
          args: z.object({}),
          run: () => ({ ok: true, message: "not sent yet" }),
        }),
      ],
    });
    expect(await tool?.execute({})).toEqual({
      ok: true,
      message: "fill_form: not sent yet",
    });
  });
});

describe("pointer", () => {
  const fillCommand = defineCommand({
    type: "fill",
    description: "Fill",
    args: z.object({ title: z.string() }),
    run: async ({ title }, { pointer }) => {
      await pointer.click("open");
      await pointer.type("title", title, (value) => written.push(value));
    },
  });
  let written: string[] = [];

  test("without a pointer, run without moving and write the whole text", async () => {
    written = [];
    const [tool] = createAiTools({ commands: [fillCommand] });
    expect(await tool?.execute({ title: "rain" })).toEqual({ ok: true });
    expect(written).toEqual(["rain"]);
  });

  test("use the pointer the caller passes", async () => {
    written = [];
    const pointed: string[] = [];
    const [tool] = createAiTools({ commands: [fillCommand] });
    await tool?.execute(
      { title: "rain" },
      {
        pointer: {
          click: async (id) => {
            pointed.push(id);
          },
          type: async (id, text, write) => {
            pointed.push(id);
            for (const char of text) write(char);
          },
        },
      },
    );
    expect(pointed).toEqual(["open", "title"]);
    expect(written).toEqual(["r", "a", "i", "n"]);
  });
});

describe("confirmation", () => {
  test("asks with the command and its confirmation before running", async () => {
    const confirm = mock(() => true);
    const { todos, byName } = setup(confirm);
    await byName("add_todo").execute({ id: "1", title: "a" });
    expect(await byName("delete_todo").execute({ id: "1" })).toEqual({
      ok: true,
    });
    expect(confirm).toHaveBeenCalledWith(
      { type: "delete_todo", id: "1" },
      {
        title: "Delete the todo?",
        description: '"a" is not done yet.',
        confirmLabel: "Delete",
      },
    );
    expect(todos).toEqual([]);
  });

  test("passes undefined when the command has no confirmation", async () => {
    const confirm = mock(() => true);
    const [tool] = createAiTools({
      commands: [
        defineCommand({
          type: "reset",
          description: "Reset",
          args: z.object({}),
          requiresConfirmation: true,
          run: () => {},
        }),
      ],
      confirm,
    });
    expect(await tool?.execute({})).toEqual({ ok: true });
    expect(confirm).toHaveBeenCalledWith({ type: "reset" }, undefined);
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

  test("accepts a run that only calls a void function", () => {
    const setName = (_: string): void => {};
    const save = async (_: string): Promise<void> => {};
    const args = z.object({ name: z.string() });
    defineCommand({
      type: "a",
      description: "A",
      args,
      run: ({ name }) => setName(name),
    });
    defineCommand({
      type: "b",
      description: "B",
      args,
      run: ({ name }) => save(name),
    });
    defineCommand({
      type: "c",
      description: "C",
      args,
      // @ts-expect-error a success needs a message
      run: () => ({ ok: true }),
    });
  });
});
