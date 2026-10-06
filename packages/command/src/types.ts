import type { z } from "zod";

/**
 * 引数の定義（zod のオブジェクト）
 * 同じ定義を、検証・WebMCP の `inputSchema`（`z.toJSONSchema`）・AI 向けの短い一覧に使う
 * @see docs/commands.md
 */
export type ArgsSchema = z.ZodObject;

/**
 * `run` の戻り値。成功なら何も返さない
 * ドメイン上のエラー（存在しない ID など）は `{ ok: false, message }` で返す。`message` は LLM が読んで直せる英文にする
 */
export type RunResult = undefined | { ok: false; message: string };

/**
 * AI が実行する前に、確認フックで承認を得るか。関数なら引数で判定する
 * 状態を見て判定したいときは、Command を作るときに状態を閉じ込める
 * @see docs/commands.md
 */
export type ConfirmationRule<Args> =
  | boolean
  | { bivarianceHack(args: Args): boolean }["bivarianceHack"];

export type CommandDefinition<
  Type extends string = string,
  Schema extends ArgsSchema = ArgsSchema,
> = {
  /** snake_case の動詞始まり（`add_todo`）。そのまま AI 向けのツール名になる */
  type: Type;
  /** 何をするか（英文）。AI 向けのツールの説明に使う */
  description: string;
  args: Schema;
  requiresConfirmation?: ConfirmationRule<z.output<Schema>>;
  /** サイトの関数（setter など）を呼ぶ。`args` は検証済み */
  run(args: z.output<Schema>): RunResult | Promise<RunResult>;
};

/** 確認フックに渡す Command（`{ type, ...args }` の平らな形） */
export type Command = { type: string } & Record<string, unknown>;

/** 確認が要る Command を実行してよいか尋ねる。承認したら `true` */
export type ConfirmHandler = (command: Command) => boolean | Promise<boolean>;

/**
 * - `invalid_command`: 引数の形が違う（未定義のフィールド・必須の欠け・型の違い）
 * - `rejected`: 確認で拒否された、または確認フックがない
 * - `domain_error`: `run` が失敗を返した
 */
export type ErrorCode = "invalid_command" | "rejected" | "domain_error";

export type ExecuteResult =
  | { ok: true }
  | { ok: false; code: ErrorCode; message: string };
