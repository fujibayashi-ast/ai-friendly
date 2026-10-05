import type {
  Command,
  CommandDefinition,
  CommandOf,
  CommandSource,
  ExecuteResult,
  HistoryEntry,
} from "./types";
import { validateCommands } from "./validate";

export type ConfirmHandler = (
  commands: readonly Command[],
) => boolean | Promise<boolean>;

export type CommandSessionOptions<
  State,
  Defs extends readonly CommandDefinition<State>[],
> = {
  initialState: State;
  commands: Defs;
  confirm?: ConfirmHandler;
};

export type CommandSession<
  State,
  Defs extends readonly CommandDefinition<State>[],
> = {
  definitions: Defs;
  getState(): State;
  execute(
    commands: CommandOf<Defs[number]> | readonly CommandOf<Defs[number]>[],
    source?: CommandSource,
  ): Promise<ExecuteResult>;
  executeRaw(input: unknown, source: CommandSource): Promise<ExecuteResult>;
  undo(): ExecuteResult;
  redo(): ExecuteResult;
  canUndo(): boolean;
  canRedo(): boolean;
  getHistory(): HistoryEntry[];
  subscribe(listener: () => void): () => void;
};

type Entry<State> = HistoryEntry & { before: State; after: State };

export function createCommandSession<
  State,
  const Defs extends readonly CommandDefinition<State>[],
>(options: CommandSessionOptions<State, Defs>): CommandSession<State, Defs> {
  const definitions = new Map(options.commands.map((d) => [d.type, d]));
  const listeners = new Set<() => void>();
  const past: Entry<State>[] = [];
  let future: Entry<State>[] = [];
  let state = options.initialState;

  const setState = (next: State) => {
    state = next;
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
      validated.commands.some((v) => v.definition.requiresConfirmation);
    if (needsConfirmation && !(await options.confirm?.(commands))) {
      return {
        ok: false,
        code: "rejected",
        message: "commands: rejected by the user",
      };
    }

    const before = state;
    let next = state;
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
    getState: () => state,
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
