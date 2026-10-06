import { describe, expect, test } from "bun:test";
import { type TodoState, todoCommands } from "../__fixtures__/todo-commands";
import { createCommandSession } from "../session";
import { createAiTools } from "./create-ai-tools";

const setup = (confirm?: () => boolean) => {
  const session = createCommandSession({
    initialState: { todos: [] } as TodoState,
    commands: todoCommands,
    confirm,
  });
  const tools = createAiTools(session, {
    describeState: (state) =>
      state.todos.map(({ id, title }) => ({ id, title })),
  });
  const byName = (name: string) => {
    const tool = tools.all.find((t) => t.name === name);
    if (!tool) throw new Error(`no tool ${name}`);
    return tool;
  };
  return { session, tools, byName };
};

describe("execute_commands", () => {
  test("lists commands in the description", () => {
    const { tools } = setup();
    expect(tools.batch.description).toContain(
      "add_todo(id: string, title: string, tags?: string[]) — Add a todo",
    );
  });

  test("runs a batch as AI", async () => {
    const { tools, session } = setup();
    const result = await tools.batch.execute({
      commands: [
        { type: "add_todo", id: "1", title: "a" },
        { type: "add_todo", id: "2", title: "b" },
      ],
    });
    expect(result).toEqual({ ok: true });
    expect(session.getState().todos.map((t) => t.title)).toEqual(["a", "b"]);
  });

  test("returns validation errors for the LLM", async () => {
    const { tools } = setup();
    expect(await tools.batch.execute({ cmds: [] })).toEqual({
      ok: false,
      code: "invalid_command",
      message: 'input: expected {"commands": [...]}',
    });
    expect(
      await tools.batch.execute({ commands: [{ type: "add_todo", id: "1" }] }),
    ).toEqual({
      ok: false,
      code: "invalid_command",
      message: 'commands[0]: missing required field "title" in add_todo',
    });
  });

  test("goes through the confirmation hook", async () => {
    const { tools, session } = setup(() => false);
    await session.execute({ type: "add_todo", id: "1", title: "a" });
    const result = await tools.batch.execute({
      commands: [{ type: "delete_todo", id: "1" }],
    });
    expect(result).toMatchObject({ ok: false, code: "rejected" });
  });
});

describe("per-command tools", () => {
  test("has one tool per command with a JSON Schema", () => {
    const { tools, byName } = setup();
    expect(tools.perCommand.map((t) => t.name)).toEqual([
      "add_todo",
      "delete_todo",
      "complete_todo",
      "set_priority",
    ]);
    expect(byName("add_todo").inputSchema).toMatchObject({
      type: "object",
      properties: { id: { type: "string" }, title: { type: "string" } },
      required: ["id", "title"],
    });
  });

  test("runs the command as AI", async () => {
    const { byName, session } = setup();
    expect(await byName("add_todo").execute({ id: "1", title: "a" })).toEqual({
      ok: true,
    });
    expect(session.getState().todos).toHaveLength(1);
    // 発行元が "ai" なので、確認フックのない削除は拒否される
    expect(await byName("delete_todo").execute({ id: "1" })).toMatchObject({
      code: "rejected",
    });
  });

  test("rejects a non-object input", async () => {
    const { byName } = setup();
    expect(await byName("add_todo").execute("1")).toEqual({
      ok: false,
      code: "invalid_command",
      message: "input: expected an object",
    });
  });
});

describe("get_state", () => {
  test("returns the described state and is read-only", async () => {
    const { byName, session } = setup();
    await session.execute({ type: "add_todo", id: "1", title: "a" });
    const tool = byName("get_state");
    expect(tool.annotations).toEqual({ readOnlyHint: true });
    expect(await tool.execute(undefined)).toEqual([{ id: "1", title: "a" }]);
  });

  test("is not created without describeState", () => {
    const session = createCommandSession({
      initialState: { todos: [] } as TodoState,
      commands: todoCommands,
    });
    const tools = createAiTools(session);
    expect(tools.getState).toBeUndefined();
    expect(tools.all.map((t) => t.name)).not.toContain("get_state");
  });
});
