import type { z } from "zod";
import type { CommandDefinition } from "./types";

export type ValidationResult =
  | { ok: true; args: Record<string, unknown> }
  | { ok: false; message: string };

export function validateArgs(
  input: unknown,
  definition: CommandDefinition,
): ValidationResult {
  const value = input ?? {};
  if (!isRecord(value))
    return { ok: false, message: "input: expected an object" };
  const parsed = definition.args
    .strict()
    .safeParse(value, { reportInput: true });
  if (!parsed.success) {
    return { ok: false, message: formatIssue(parsed.error.issues, definition) };
  }
  return { ok: true, args: parsed.data };
}

const path = "input";

function formatIssue(
  issues: readonly z.core.$ZodIssue[],
  definition: CommandDefinition,
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
