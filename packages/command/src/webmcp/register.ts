import type { AiTool } from "../ai/create-ai-tools";
import type { Pointer } from "../types";

/** WebMCP の `modelContext` のうち、登録に使う部分 */
export type ModelContext = {
  registerTool(tool: AiTool, options?: { signal?: AbortSignal }): unknown;
};

export type RegisterWebMcpToolsOptions = {
  /** abort するとツールの登録を解除する */
  signal?: AbortSignal;
  /** 省略時は `document.modelContext`、なければ `navigator.modelContext` */
  modelContext?: ModelContext;
  /** ツールの実行に渡す `pointer`。チャットと同じものを渡すと、同じ動きになる */
  pointer?: Pointer;
};

/**
 * ツールを WebMCP に登録する。WebMCP が使えないブラウザでは何もせず `false` を返す
 * 登録の途中で `signal` が abort されたときも、投げずに `false` を返す
 * @see docs/ai-tools.md
 */
export async function registerWebMcpTools(
  tools: readonly AiTool[],
  options: RegisterWebMcpToolsOptions = {},
): Promise<boolean> {
  const { signal, pointer } = options;
  const modelContext = options.modelContext ?? findModelContext();
  if (!modelContext) return false;
  for (const tool of tools) {
    if (signal?.aborted) return false;
    try {
      // WebMCP は execute の 2 つ目に自分の client を渡すので、入力と pointer だけを渡す
      await modelContext.registerTool(
        { ...tool, execute: (input) => tool.execute(input, { pointer }) },
        { signal },
      );
    } catch (error) {
      // 解除（abort）は意図した動きなので、その失敗は受け止める
      if (signal?.aborted) return false;
      throw error;
    }
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
