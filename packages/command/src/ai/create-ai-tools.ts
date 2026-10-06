import { z } from "zod";
import { runCommand } from "../run-command";
import type { CommandDefinition, ConfirmHandler } from "../types";
import { confirmationMark } from "./describe-commands";

/** AI に渡すツール。WebMCP の `registerTool` にもそのまま渡せる形 */
export type AiTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(input: unknown): Promise<unknown>;
  annotations?: { readOnlyHint?: boolean };
};

export type AiToolsOptions = {
  commands: readonly CommandDefinition[];
  /** 省略すると、確認が要る Command はすべて `rejected` になる */
  confirm?: ConfirmHandler;
  /** AI に見せる今の状態（ID など、Command を組み立てるのに要る情報）。渡したときだけ `get_state` を作る */
  getState?: () => unknown;
};

/**
 * Command ごとの AI 向けツールと `get_state` を作る
 * ツールの実行は、引数の検証 → 確認 → `run` の順に進む
 *
 * @example
 * const tools = createAiTools({
 *   commands: [setLanguageCommand, resetSettingsCommand],
 *   confirm: (command, confirmation) =>
 *     window.confirm(confirmation?.title ?? `Run ${command.type}?`),
 *   getState: () => ({ theme, language }),
 * });
 * await registerWebMcpTools(tools, { signal });
 * @see docs/ai-tools.md
 */
export function createAiTools(options: AiToolsOptions): AiTool[] {
  const tools = options.commands.map(
    (definition): AiTool => ({
      name: definition.type,
      description: definition.description + confirmationMark(definition),
      inputSchema: z.toJSONSchema(definition.args, { io: "input" }),
      execute: (input) => runCommand(definition, input, options.confirm),
    }),
  );

  const { getState } = options;
  if (getState) {
    tools.push({
      name: "get_state",
      description:
        "Get the current state. Use it to find IDs and values before running commands.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => getState(),
      annotations: { readOnlyHint: true },
    });
  }
  return tools;
}
