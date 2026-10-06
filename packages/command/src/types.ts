import type { z } from "zod";

/** Command の発行元。`"ai"` のときだけ確認フック（`requiresConfirmation`）が働く */
export type CommandSource = "user" | "ai";

/**
 * 引数の定義（zod のオブジェクト）
 * 同じ定義を、検証・WebMCP の `inputSchema`（`z.toJSONSchema`）・AI 向けのツール説明に使う
 * @see docs/commands.md
 */
export type ArgsSchema = z.ZodObject;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * `apply` の戻り値
 * ドメイン上のエラー（存在しない ID など）は `{ ok: false, message }` で返す
 * `message` は LLM が読んで直せる英文にする
 */
export type ApplyResult<State> =
  | { ok: true; state: State }
  | { ok: false; message: string };

/**
 * 発行元が `"ai"` のとき、確認フックで承認を得てから実行するか
 * 関数なら、バッチ実行前の状態と引数で判定する（例: 未完了の TODO を消すときだけ確認する）
 * 関数で書くときは `apply` より後に書く（状態の型を `apply` の注釈から推論するため）
 * @see docs/commands.md
 */
export type ConfirmationRule<State, Args> =
  | boolean
  | { bivarianceHack(state: State, args: Args): boolean }["bivarianceHack"];

export type CommandDefinition<
  State,
  Type extends string = string,
  Schema extends ArgsSchema = ArgsSchema,
> = {
  /** snake_case の動詞始まり（`add_todo`） */
  type: Type;
  /** 何をするか（英文）。AI 向けのツール説明に使う */
  description: string;
  args: Schema;
  requiresConfirmation?: ConfirmationRule<State, z.output<Schema>>;
  /**
   * 新しい状態を返す。`state` は書き換えない
   * ID などは Command 側で受け取り、ここで生成しない（同じ Command 列なら同じ結果にするため）
   */
  apply(state: State, args: z.output<Schema>): ApplyResult<State>;
};

/** 定義から求めた、`execute` に渡す Command の型（`{ type, ...args }`） */
export type CommandOf<D> =
  D extends CommandDefinition<infer _S, infer T, infer Schema>
    ? Simplify<{ type: T } & WithoutIndexSignature<z.input<Schema>>>
    : never;

// zod v4 は `z.object({})` を `{ [x: string]: never }` にするため、そのままだと `type` まで never になる
type WithoutIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

/** 型を特定しない Command（`{ type, ...args }` の平らな形） */
export type Command = { type: string } & Record<string, unknown>;

/**
 * - `invalid_command`: 形が違う（未定義の Command・フィールド、型の違い）
 * - `domain_error`: `apply` が失敗した
 * - `rejected`: 確認で拒否された、または確認フックがない
 * - `nothing_to_undo` / `nothing_to_redo`: 戻せる / やり直せる履歴がない
 * - `state_changed`: バッチの後に状態が外（画面の操作など）で変わったため、戻さなかった
 */
export type ErrorCode =
  | "invalid_command"
  | "domain_error"
  | "rejected"
  | "nothing_to_undo"
  | "nothing_to_redo"
  | "state_changed";

export type ExecuteResult =
  | { ok: true }
  | { ok: false; code: ErrorCode; message: string };

/** 実行したバッチ 1 つ分の記録 */
export type HistoryEntry = {
  commands: readonly Command[];
  source: CommandSource;
};
