import type { z } from "zod";
import type { Command, CommandDefinition } from "./types";

export type ValidatedCommand<State> = {
  command: Command;
  args: Record<string, unknown>;
  definition: CommandDefinition<State>;
};

export type ValidationResult<State> =
  | { ok: true; commands: ValidatedCommand<State>[] }
  | { ok: false; message: string };

export function validateCommands<State>(
  input: unknown,
  definitions: ReadonlyMap<string, CommandDefinition<State>>,
): ValidationResult<State> {
  const items = Array.isArray(input) ? input : [input];
  if (items.length === 0) {
    return { ok: false, message: "commands: expected at least 1 command" };
  }

  const commands: ValidatedCommand<State>[] = [];
  for (const [index, item] of items.entries()) {
    const path = `commands[${index}]`;
    if (!isRecord(item) || typeof item.type !== "string") {
      return {
        ok: false,
        message: `${path}: expected an object with a string "type"`,
      };
    }
    const definition = definitions.get(item.type);
    if (!definition) {
      const available = [...definitions.keys()].join(", ");
      return {
        ok: false,
        message: `${path}: unknown command "${item.type}" (available: ${available})`,
      };
    }
    const { type: _, ...rest } = item;
    const parsed = definition.args
      .strict()
      .safeParse(rest, { reportInput: true });
    if (!parsed.success) {
      return {
        ok: false,
        message: formatIssue(parsed.error.issues, path, definition),
      };
    }
    const args = parsed.data;
    commands.push({ command: { ...args, type: item.type }, args, definition });
  }
  return { ok: true, commands };
}

function formatIssue<State>(
  issues: readonly z.core.$ZodIssue[],
  path: string,
  definition: CommandDefinition<State>,
): string {
  const [issue] = issues;
  if (!issue) return `${path}: invalid arguments for ${definition.type}`;
  const at = path + formatPath(issue.path);

  if (issue.code === "unrecognized_keys" && issue.path.length === 0) {
    const fields = Object.keys(definition.args.shape).join(", ");
    return `${at}: unknown field "${issue.keys[0]}" in ${definition.type} (fields: ${fields})`;
  }
  if (issue.code === "invalid_type" && issue.input === undefined) {
    const parent = issue.path.slice(0, -1);
    const field = issue.path.at(-1);
    const name = parent.length === 0 ? definition.type : "object";
    return `${path + formatPath(parent)}: missing required field "${String(field)}" in ${name}`;
  }
  return `${at}: ${issue.message}`;
}

function formatPath(segments: readonly PropertyKey[]): string {
  return segments
    .map((s) => (typeof s === "number" ? `[${s}]` : `.${String(s)}`))
    .join("");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
