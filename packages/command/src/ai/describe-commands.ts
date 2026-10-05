import { z } from "zod";
import type { CommandDefinition } from "../types";

type JsonSchema = {
  type?: string | string[];
  enum?: readonly unknown[];
  const?: unknown;
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: readonly string[];
  anyOf?: readonly JsonSchema[];
};

/**
 * 小さい LLM 向けに、Command を 1 行ずつの短い一覧にする
 * 例: `add_todo(id: string, tags?: string[]) — Add a todo`
 * @see docs/ai-tools.md
 */
export function describeCommands<State>(
  definitions: readonly CommandDefinition<State>[],
): string {
  return definitions.map(describeCommand).join("\n");
}

function describeCommand<State>(definition: CommandDefinition<State>): string {
  const schema = z.toJSONSchema(definition.args, {
    io: "input",
  }) as JsonSchema;
  const params = formatFields(schema).join(", ");
  return `${definition.type}(${params}) — ${definition.description}${confirmationMark(definition)}`;
}

function confirmationMark<State>(definition: CommandDefinition<State>): string {
  const rule = definition.requiresConfirmation;
  if (typeof rule === "function") return " [may ask the user to confirm]";
  return rule ? " [asks the user to confirm]" : "";
}

function formatFields(schema: JsonSchema): string[] {
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties ?? {}).map(
    ([key, value]) =>
      `${key}${required.has(key) ? "" : "?"}: ${formatType(value)}`,
  );
}

function formatType(schema: JsonSchema): string {
  if (schema.enum) return schema.enum.map((v) => JSON.stringify(v)).join("|");
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.anyOf) return schema.anyOf.map(formatType).join("|");
  if (Array.isArray(schema.type)) return schema.type.join("|");
  switch (schema.type) {
    case "array": {
      const item = schema.items ? formatType(schema.items) : "unknown";
      return item.includes("|") ? `(${item})[]` : `${item}[]`;
    }
    case "object":
      return `{ ${formatFields(schema).join(", ")} }`;
    case undefined:
      return "unknown";
    default:
      return schema.type;
  }
}
