import type {
  ApplyResult,
  CommandDefinition,
  InferArg,
  ObjectSchema,
} from "./types";

/**
 * Command を定義する。`args` から `apply` の引数の型を推論する
 * 状態の型は `apply` の第 1 引数の注釈から決まる
 *
 * @example
 * const addTodo = defineCommand({
 *   type: "add_todo",
 *   description: "Add a todo",
 *   args: {
 *     type: "object",
 *     properties: { id: { type: "string" }, title: { type: "string" } },
 *     required: ["id", "title"],
 *   },
 *   apply(state: TodoState, args) {
 *     return { ok: true, state: { todos: [...state.todos, { ...args, done: false }] } };
 *   },
 * });
 * @see docs/commands.md
 */
export function defineCommand<
  State,
  const Type extends string,
  const Args extends ObjectSchema,
>(definition: {
  type: Type;
  description: string;
  args: Args;
  requiresConfirmation?: boolean;
  apply(state: State, args: InferArg<Args>): ApplyResult<State>;
}): CommandDefinition<State, Type, InferArg<Args>> {
  return definition;
}
