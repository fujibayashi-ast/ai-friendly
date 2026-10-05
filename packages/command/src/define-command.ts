import type {
  ApplyResult,
  CommandDefinition,
  InferArg,
  ObjectSchema,
} from "./types";

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
