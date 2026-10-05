import type {
  ArgSchema,
  Command,
  CommandDefinition,
  ObjectSchema,
} from "./types";

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
    const { type: _, ...args } = item;
    const error = checkObject(args, definition.args, path, definition.type);
    if (error) return { ok: false, message: error };
    commands.push({ command: { ...args, type: item.type }, args, definition });
  }
  return { ok: true, commands };
}

function checkValue(
  value: unknown,
  schema: ArgSchema,
  path: string,
): string | undefined {
  switch (schema.type) {
    case "string":
      if (typeof value !== "string") return mismatch(path, "string", value);
      if (schema.enum && !schema.enum.includes(value)) {
        return `${path}: expected one of ${schema.enum.map((v) => `"${v}"`).join(", ")}, got "${value}"`;
      }
      return;
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return mismatch(path, "number", value);
      }
      return;
    case "integer":
      if (typeof value === "number" && !Number.isInteger(value)) {
        return `${path}: expected integer, got ${value}`;
      }
      if (!Number.isInteger(value)) return mismatch(path, "integer", value);
      return;
    case "boolean":
      if (typeof value !== "boolean") return mismatch(path, "boolean", value);
      return;
    case "array":
      if (!Array.isArray(value)) return mismatch(path, "array", value);
      for (const [index, item] of value.entries()) {
        const error = checkValue(item, schema.items, `${path}[${index}]`);
        if (error) return error;
      }
      return;
    case "object":
      if (!isRecord(value)) return mismatch(path, "object", value);
      return checkObject(value, schema, path, "object");
  }
}

function checkObject(
  value: Record<string, unknown>,
  schema: ObjectSchema,
  path: string,
  name: string,
): string | undefined {
  const fields = Object.keys(schema.properties);
  for (const key of Object.keys(value)) {
    if (!(key in schema.properties)) {
      return `${path}: unknown field "${key}" in ${name} (fields: ${fields.join(", ")})`;
    }
  }
  for (const key of schema.required ?? []) {
    if (value[key] === undefined) {
      return `${path}: missing required field "${key}" in ${name}`;
    }
  }
  for (const [key, propertySchema] of Object.entries(schema.properties)) {
    if (value[key] === undefined) continue;
    const error = checkValue(value[key], propertySchema, `${path}.${key}`);
    if (error) return error;
  }
}

function mismatch(path: string, expected: string, value: unknown): string {
  return `${path}: expected ${expected}, got ${describe(value)}`;
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number" && !Number.isFinite(value))
    return String(value);
  return typeof value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
