import { noPointer } from "./pointer";
import type {
  CommandDefinition,
  ConfirmHandler,
  ExecuteOptions,
  ExecuteResult,
} from "./types";
import { validateArgs } from "./validate";

export async function runCommand(
  definition: CommandDefinition,
  input: unknown,
  confirm: ConfirmHandler | undefined,
  options: ExecuteOptions = {},
): Promise<ExecuteResult> {
  const validated = validateArgs(input, definition);
  if (!validated.ok) {
    return { ok: false, code: "invalid_command", message: validated.message };
  }
  const { args } = validated;

  const rule = definition.requiresConfirmation;
  const needsConfirmation =
    typeof rule === "function" ? rule(args) : rule === true;
  if (
    needsConfirmation &&
    !(await confirm?.(
      { ...args, type: definition.type },
      definition.confirmation?.(args),
    ))
  ) {
    return {
      ok: false,
      code: "rejected",
      message: `${definition.type}: rejected by the user`,
    };
  }

  const result = await definition.run(args, {
    pointer: options.pointer ?? noPointer,
  });
  if (!result) return { ok: true };
  const message = `${definition.type}: ${result.message}`;
  return result.ok
    ? { ok: true, message }
    : { ok: false, code: "domain_error", message };
}
