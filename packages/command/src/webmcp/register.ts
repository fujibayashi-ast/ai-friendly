import type { AiTool } from "../ai/create-ai-tools";

/** WebMCP の `modelContext` のうち、登録に使う部分 */
export type ModelContext = {
  registerTool(tool: AiTool, options?: { signal?: AbortSignal }): unknown;
};

export type RegisterWebMcpToolsOptions = {
  /** abort するとツールの登録を解除する */
  signal?: AbortSignal;
  /** 省略時は `document.modelContext`、なければ `navigator.modelContext` */
  modelContext?: ModelContext;
};

/**
 * ツールを WebMCP に登録する。WebMCP が使えないブラウザでは何もせず `false` を返す
 * @see docs/ai-tools.md
 */
export async function registerWebMcpTools(
  tools: readonly AiTool[],
  options: RegisterWebMcpToolsOptions = {},
): Promise<boolean> {
  const modelContext = options.modelContext ?? findModelContext();
  if (!modelContext) return false;
  for (const tool of tools) {
    await modelContext.registerTool(tool, { signal: options.signal });
  }
  return true;
}

function findModelContext(): ModelContext | undefined {
  const candidates = [
    readModelContext(globalThis.document),
    readModelContext(globalThis.navigator),
  ];
  return candidates.find(isModelContext);
}

function readModelContext(owner: object | undefined): unknown {
  return owner && "modelContext" in owner ? owner.modelContext : undefined;
}

function isModelContext(value: unknown): value is ModelContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "registerTool" in value &&
    typeof value.registerTool === "function"
  );
}
