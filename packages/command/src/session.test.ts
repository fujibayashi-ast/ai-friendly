import { describe, expect, mock, test } from "bun:test";
import { createCommandSession } from "./session";
import { type TodoState, todoCommands } from "./todo.fixture";

const createSession = (confirm?: () => boolean | Promise<boolean>) =>
  createCommandSession({
    initialState: { todos: [] } as TodoState,
    commands: todoCommands,
    confirm,
  });

const titles = (state: TodoState) => state.todos.map((t) => t.title);

describe("execute", () => {
  test("applies a batch in order", async () => {
    const session = createSession();
    const result = await session.execute([
      { type: "add_todo", id: "1", title: "a" },
      { type: "add_todo", id: "2", title: "b" },
    ]);
    expect(result).toEqual({ ok: true });
    expect(titles(session.getState())).toEqual(["a", "b"]);
  });

  test("does not apply any command when one fails", async () => {
    const session = createSession();
    const before = session.getState();
    const result = await session.execute([
      { type: "add_todo", id: "1", title: "a" },
      { type: "add_todo", id: "1", title: "dup" },
    ]);
    expect(result).toEqual({
      ok: false,
      code: "domain_error",
      message: 'commands[1] (add_todo): todo "1" already exists',
    });
    expect(session.getState()).toBe(before);
    expect(session.canUndo()).toBe(false);
  });

  test("returns invalid_command for raw input from AI", async () => {
    const session = createSession();
    const result = await session.executeRaw(
      { type: "add_todo", id: 1, title: "a" },
      "ai",
    );
    expect(result).toEqual({
      ok: false,
      code: "invalid_command",
      message: "commands[0].id: expected string, got number",
    });
  });

  test("records commands and source in history", async () => {
    const session = createSession();
    await session.execute({ type: "add_todo", id: "1", title: "a" });
    await session.executeRaw([{ type: "add_todo", id: "2", title: "b" }], "ai");
    expect(session.getHistory()).toEqual([
      { commands: [{ type: "add_todo", id: "1", title: "a" }], source: "user" },
      { commands: [{ type: "add_todo", id: "2", title: "b" }], source: "ai" },
    ]);
  });
});

describe("confirmation", () => {
  test("asks once for an AI batch with a command that requires confirmation", async () => {
    const confirm = mock(() => true);
    const session = createSession(confirm);
    await session.execute({ type: "add_todo", id: "1", title: "a" });
    const result = await session.execute(
      [
        { type: "delete_todo", id: "1" },
        { type: "add_todo", id: "2", title: "b" },
      ],
      "ai",
    );
    expect(result).toEqual({ ok: true });
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(titles(session.getState())).toEqual(["b"]);
  });

  test("does not ask for user commands or AI commands without the flag", async () => {
    const confirm = mock(() => true);
    const session = createSession(confirm);
    await session.execute({ type: "add_todo", id: "1", title: "a" }, "ai");
    await session.execute({ type: "delete_todo", id: "1" }, "user");
    expect(confirm).not.toHaveBeenCalled();
  });

  test("rejects when the user declines or no handler is set", async () => {
    for (const session of [createSession(async () => false), createSession()]) {
      await session.execute({ type: "add_todo", id: "1", title: "a" });
      const result = await session.execute(
        { type: "delete_todo", id: "1" },
        "ai",
      );
      expect(result).toEqual({
        ok: false,
        code: "rejected",
        message: "commands: rejected by the user",
      });
      expect(titles(session.getState())).toEqual(["a"]);
    }
  });

  test("validates before asking", async () => {
    const confirm = mock(() => true);
    const session = createSession(confirm);
    const result = await session.executeRaw({ type: "delete_todo" }, "ai");
    expect(result.ok).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
  });
});

describe("undo / redo", () => {
  test("undoes and redoes a whole batch", async () => {
    const session = createSession();
    await session.execute({ type: "add_todo", id: "1", title: "a" });
    await session.execute([
      { type: "add_todo", id: "2", title: "b" },
      { type: "add_todo", id: "3", title: "c" },
    ]);

    expect(session.undo()).toEqual({ ok: true });
    expect(titles(session.getState())).toEqual(["a"]);
    expect(session.redo()).toEqual({ ok: true });
    expect(titles(session.getState())).toEqual(["a", "b", "c"]);
  });

  test("clears redo after a new execute", async () => {
    const session = createSession();
    await session.execute({ type: "add_todo", id: "1", title: "a" });
    session.undo();
    await session.execute({ type: "add_todo", id: "2", title: "b" });
    expect(session.canRedo()).toBe(false);
    expect(session.redo()).toEqual({
      ok: false,
      code: "nothing_to_redo",
      message: "nothing to redo",
    });
  });

  test("reports nothing to undo", () => {
    expect(createSession().undo()).toEqual({
      ok: false,
      code: "nothing_to_undo",
      message: "nothing to undo",
    });
  });
});

describe("subscribe", () => {
  test("notifies on execute / undo / redo until unsubscribed", async () => {
    const session = createSession();
    const listener = mock(() => {});
    const unsubscribe = session.subscribe(listener);

    await session.execute({ type: "add_todo", id: "1", title: "a" });
    session.undo();
    session.redo();
    await session.execute({ type: "add_todo", id: "1", title: "dup" });
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    session.undo();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});

describe("types", () => {
  test("execute only accepts defined commands", async () => {
    const session = createSession();
    // @ts-expect-error unknown command type
    await session.execute({ type: "add_itme", id: "1" });
    // @ts-expect-error title must be a string
    await session.execute({ type: "add_todo", id: "1", title: 1 });
    // @ts-expect-error level must be "low" | "high"
    await session.execute({ type: "set_priority", id: "1", level: "mid" });
  });
});
