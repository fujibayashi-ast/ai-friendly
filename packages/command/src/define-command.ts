import type { z } from "zod";
import type {
  ApplyResult,
  ArgsSchema,
  CommandDefinition,
  ConfirmationRule,
} from "./types";

/**
 * Command を定義する。`args`（zod のオブジェクト）から `apply` の引数の型を推論する
 * `apply` の第 1 引数の型注釈が、セッションで扱う state の型になる（`apply` が返す `state` の型も同じ）
 *
 * @example
 * const addTodo = defineCommand({
 *   type: "add_todo",
 *   description: "Add a todo",
 *   args: z.object({ id: z.string(), title: z.string() }),
 *   apply(state: TodoState, args) {
 *     return { ok: true, state: { todos: [...state.todos, { ...args, done: false }] } };
 *   },
 * });
 * @see docs/commands.md
 */
export function defineCommand<
  State,
  const Type extends string,
  Schema extends ArgsSchema,
>(definition: {
  type: Type;
  description: string;
  args: Schema;
  requiresConfirmation?: ConfirmationRule<State, z.output<Schema>>;
  apply(state: State, args: z.output<Schema>): ApplyResult<State>;
}): CommandDefinition<State, Type, Schema> {
  return definition;
}
