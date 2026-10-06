import type {
  Command,
  CommandDefinition,
  CommandOf,
  CommandSource,
  ExecuteResult,
  HistoryEntry,
} from "./types";
import { validateCommands } from "./validate";

/** AI のバッチを実行してよいか尋ねる。バッチにつき 1 回、検証の後に呼ばれる */
export type ConfirmHandler = (
  commands: readonly Command[],
) => boolean | Promise<boolean>;

/**
 * アプリが持つ状態をセッションから読み書きするための口（React の state と setter など）
 * @see docs/commands.md
 */
export type CommandStore<State> = {
  getState(): State;
  setState(next: State): void;
};

export type CommandSessionOptions<
  State,
  Defs extends readonly CommandDefinition<State>[],
> = {
  commands: Defs;
  /** 省略すると、確認が必要な AI のバッチはすべて `rejected` になる */
  confirm?: ConfirmHandler;
} & (
  | { initialState: State; store?: never }
  /** 状態をアプリが持つ。セッションは実行のたびにここから読み、結果を書く */
  | { store: CommandStore<State>; initialState?: never }
);

export type CommandSession<
  State,
  Defs extends readonly CommandDefinition<State>[],
> = {
  definitions: Defs;
  /** `initialState` のときは、変わらない限り同じ参照を返す。`store` のときは `store.getState()` */
  getState(): State;
  /**
   * 定義済みの Command を実行する。配列は 1 バッチで、1 つでも失敗したら状態を変えない
   * @param source 省略時は `"user"`
   */
  execute(
    commands: CommandOf<Defs[number]> | readonly CommandOf<Defs[number]>[],
    source?: CommandSource,
  ): Promise<ExecuteResult>;
  /** 型の分からない入力（LLM の JSON など）を実行する。検証は `execute` と同じ */
  executeRaw(input: unknown, source: CommandSource): Promise<ExecuteResult>;
  /** 直前のバッチを丸ごと戻す */
  undo(): ExecuteResult;
  redo(): ExecuteResult;
  canUndo(): boolean;
  canRedo(): boolean;
  /** 実行したバッチの一覧（古い順）。Undo したものは含まない */
  getHistory(): HistoryEntry[];
  /**
   * Command の実行・Undo / Redo で状態が変わったら `listener` を呼ぶ。戻り値は解除する関数
   * `store` の外での変更は通知しない
   */
  subscribe(listener: () => void): () => void;
};

type Entry<State> = HistoryEntry & { before: State; after: State };

/**
 * Command を実行するセッションを作る
 * 状態はセッションが持つ（`initialState`）か、アプリが持つものを読み書きする（`store`）
 *
 * @example
 * const session = createCommandSession({
 *   initialState: { todos: [] },
 *   commands: [addTodo, deleteTodo],
 *   confirm: (commands) => window.confirm(`Run ${commands.length} commands?`),
 * });
 * await session.execute({ type: "add_todo", id: crypto.randomUUID(), title: "Buy milk" });
 * await session.executeRaw(jsonFromLlm, "ai");
 *
 * // アプリの状態に AI の操作をつなぐ
 * const session = createCommandSession({ store: { getState, setState }, commands });
 * @see docs/commands.md
 */
export function createCommandSession<
  State,
  const Defs extends readonly CommandDefinition<State>[],
>(options: CommandSessionOptions<State, Defs>): CommandSession<State, Defs> {
  const definitions = new Map(options.commands.map((d) => [d.type, d]));
  const listeners = new Set<() => void>();
  const past: Entry<State>[] = [];
  let future: Entry<State>[] = [];
  const store = options.store ?? createLocalStore<State>(options.initialState);

  const setState = (next: State) => {
    store.setState(next);
    for (const listener of listeners) listener();
  };

  const executeRaw = async (
    input: unknown,
    source: CommandSource,
  ): Promise<ExecuteResult> => {
    const validated = validateCommands(input, definitions);
    if (!validated.ok) {
      return { ok: false, code: "invalid_command", message: validated.message };
    }
    const commands = validated.commands.map((v) => v.command);

    const needsConfirmation =
      source === "ai" &&
      validated.commands.some(({ definition, args }) => {
        const rule = definition.requiresConfirmation;
        return typeof rule === "function"
          ? rule(store.getState(), args)
          : rule === true;
      });
    if (needsConfirmation && !(await options.confirm?.(commands))) {
      return {
        ok: false,
        code: "rejected",
        message: "commands: rejected by the user",
      };
    }

    const before = store.getState();
    let next = before;
    for (const [
      index,
      { command, args, definition },
    ] of validated.commands.entries()) {
      const result = definition.apply(next, args);
      if (!result.ok) {
        return {
          ok: false,
          code: "domain_error",
          message: `commands[${index}] (${command.type}): ${result.message}`,
        };
      }
      next = result.state;
    }

    past.push({ commands, source, before, after: next });
    future = [];
    setState(next);
    return { ok: true };
  };

  return {
    definitions: options.commands,
    getState: () => store.getState(),
    execute: (commands, source = "user") => executeRaw(commands, source),
    executeRaw,
    undo() {
      const entry = past.pop();
      if (!entry)
        return {
          ok: false,
          code: "nothing_to_undo",
          message: "nothing to undo",
        };
      future.push(entry);
      setState(entry.before);
      return { ok: true };
    },
    redo() {
      const entry = future.pop();
      if (!entry)
        return {
          ok: false,
          code: "nothing_to_redo",
          message: "nothing to redo",
        };
      past.push(entry);
      setState(entry.after);
      return { ok: true };
    },
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    getHistory: () =>
      past.map(({ commands, source }) => ({ commands, source })),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function createLocalStore<State>(initialState: State): CommandStore<State> {
  let state = initialState;
  return {
    getState: () => state,
    setState: (next) => {
      state = next;
    },
  };
}
