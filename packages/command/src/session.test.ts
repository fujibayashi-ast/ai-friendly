import { describe, expect, mock, test } from "bun:test";
import { z } from "zod";
import { type TodoState, todoCommands } from "./__fixtures__/todo-commands";
import { defineCommand } from "./define-command";
import { createCommandSession } from "./session";
import type { ApplyResult } from "./types";

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
      message:
        "commands[0].id: Invalid input: expected string, received number",
    });
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

  test("uses a rule function with the state before the batch", async () => {
    const confirm = mock(() => true);
    const session = createSession(confirm);
    await session.execute([
      { type: "add_todo", id: "1", title: "done" },
      { type: "complete_todo", id: "1" },
      { type: "add_todo", id: "2", title: "open" },
    ]);

    await session.execute({ type: "delete_todo", id: "1" }, "ai");
    expect(confirm).not.toHaveBeenCalled();

    await session.execute(
      [
        { type: "complete_todo", id: "2" },
        { type: "delete_todo", id: "2" },
      ],
      "ai",
    );
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(titles(session.getState())).toEqual([]);
  });

  test("validates before asking", async () => {
    const confirm = mock(() => true);
    const session = createSession(confirm);
    const result = await session.executeRaw({ type: "delete_todo" }, "ai");
    expect(result.ok).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
  });
});

describe("subscribe", () => {
  test("notifies on execute until unsubscribed", async () => {
    const session = createSession();
    const listener = mock(() => {});
    const unsubscribe = session.subscribe(listener);

    await session.execute({ type: "add_todo", id: "1", title: "a" });
    await session.execute({ type: "add_todo", id: "1", title: "dup" });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    await session.execute({ type: "add_todo", id: "2", title: "b" });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("store", () => {
  const createStore = () => {
    let state: TodoState = { todos: [] };
    const setState = mock((next: TodoState) => {
      state = next;
    });
    return {
      store: { getState: () => state, setState },
      changeOutside: (next: TodoState) => {
        state = next;
      },
    };
  };

  test("reads from and writes to the store", async () => {
    const { store, changeOutside } = createStore();
    const session = createCommandSession({ store, commands: todoCommands });
    changeOutside({ todos: [{ id: "1", title: "a", done: false, tags: [] }] });

    await session.execute({ type: "add_todo", id: "2", title: "b" });
    expect(titles(store.getState())).toEqual(["a", "b"]);
    expect(session.getState()).toBe(store.getState());

    await session.execute({ type: "add_todo", id: "1", title: "dup" });
    expect(store.setState).toHaveBeenCalledTimes(1);
  });

  test("passes the current state of the store to a confirmation rule", async () => {
    const { store, changeOutside } = createStore();
    const confirm = mock(() => true);
    const session = createCommandSession({
      store,
      commands: todoCommands,
      confirm,
    });
    changeOutside({ todos: [{ id: "1", title: "a", done: true, tags: [] }] });
    await session.execute({ type: "delete_todo", id: "1" }, "ai");
    expect(confirm).not.toHaveBeenCalled();
    expect(store.getState().todos).toEqual([]);
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

  test("takes either initialState or store", () => {
    const store = { getState: (): TodoState => ({ todos: [] }), setState() {} };
    // @ts-expect-error initialState and store are exclusive
    createCommandSession({
      initialState: { todos: [] },
      store,
      commands: todoCommands,
    });
    // @ts-expect-error one of them is required
    createCommandSession({ commands: todoCommands });
  });

  test("accepts a command without arguments", async () => {
    const clear = defineCommand({
      type: "clear",
      description: "Clear",
      args: z.object({}),
      apply(): ApplyResult<TodoState> {
        return { ok: true, state: { todos: [] } };
      },
    });
    const session = createCommandSession({
      initialState: { todos: [] } as TodoState,
      commands: [...todoCommands, clear],
    });
    expect(await session.execute({ type: "clear" })).toEqual({ ok: true });
    // @ts-expect-error clear has no fields
    await session.execute({ type: "clear", id: "1" });
    // @ts-expect-error optional fields stay optional and typed
    await session.execute({ type: "add_todo", id: "1", title: "a", tags: [1] });
  });
});
