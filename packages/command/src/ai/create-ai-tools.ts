import { z } from "zod";
import type { CommandSession } from "../session";
import type { CommandDefinition, ExecuteResult } from "../types";
import { describeCommands } from "./describe-commands";

/** AI に渡すツール。WebMCP の `registerTool` にもそのまま渡せる形 */
export type AiTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(input: unknown): Promise<unknown>;
  annotations?: { readOnlyHint?: boolean };
};

export type AiTools = {
  /** `execute_commands`: 複数の Command を 1 バッチで実行する */
  batch: AiTool;
  /** Command ごとのツール（ツール名は Command の `type`） */
  perCommand: AiTool[];
  /** `get_state`: `describeState` を渡したときだけ作る */
  getState?: AiTool;
  all: AiTool[];
};

export type AiToolsOptions<State> = {
  /** AI に見せる状態。ID など、AI が Command を組み立てるのに要る情報を返す */
  describeState?: (state: State) => unknown;
};

/**
 * セッションから AI 向けのツールを作る。実行はすべて `session.executeRaw(…, "ai")` を通る
 * @see docs/ai-tools.md
 */
export function createAiTools<
  State,
  Defs extends readonly CommandDefinition<State>[],
>(
  session: CommandSession<State, Defs>,
  options: AiToolsOptions<State> = {},
): AiTools {
  const definitions: readonly CommandDefinition<State>[] = session.definitions;

  const batch: AiTool = {
    name: "execute_commands",
    description: [
      "Run one or more commands as a single batch. If any command fails, none are applied. One undo reverts the whole batch.",
      'Input: {"commands": [{"type": "<command>", ...fields}]}',
      "Commands:",
      describeCommands(definitions),
    ].join("\n"),
    inputSchema: {
      type: "object",
      properties: {
        commands: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: definitions.map((d) => d.type) },
            },
            required: ["type"],
          },
        },
      },
      required: ["commands"],
    },
    execute: async (input) => {
      if (!isRecord(input) || !("commands" in input)) {
        return invalid('input: expected {"commands": [...]}');
      }
      return session.executeRaw(input.commands, "ai");
    },
  };

  const perCommand = definitions.map(
    (definition): AiTool => ({
      name: definition.type,
      description: definition.description,
      inputSchema: z.toJSONSchema(definition.args, { io: "input" }),
      execute: async (input) => {
        if (input !== undefined && !isRecord(input)) {
          return invalid("input: expected an object");
        }
        return session.executeRaw({ ...input, type: definition.type }, "ai");
      },
    }),
  );

  const { describeState } = options;
  const getState: AiTool | undefined = describeState && {
    name: "get_state",
    description:
      "Get the current state. Use it to find IDs and values before running commands.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => describeState(session.getState()),
    annotations: { readOnlyHint: true },
  };

  return {
    batch,
    perCommand,
    getState,
    all: [batch, ...perCommand, ...(getState ? [getState] : [])],
  };
}

function invalid(message: string): ExecuteResult {
  return { ok: false, code: "invalid_command", message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
