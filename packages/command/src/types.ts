import type { z } from "zod";

/**
 * 引数の定義（zod のオブジェクト）
 * 同じ定義を、検証・WebMCP の `inputSchema`（`z.toJSONSchema`）・AI 向けの短い一覧に使う
 * @see docs/commands.md
 */
export type ArgsSchema = z.ZodObject;

/**
 * `run` の戻り値。成功なら何も返さなくてよい
 * ドメイン上のエラー（存在しない ID など）は `{ ok: false, message }` で返す。`message` は LLM が読んで直せる英文にする
 * 成功でも AI に次の一手を伝えたいとき（まだ送っていない、など）は `{ ok: true, message }` で返す
 * @see docs/commands.md
 */
export type RunResult =
  | undefined
  | { ok: true; message: string }
  | { ok: false; message: string };

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
  /** 確認で見せる文言。確認フックにそのまま渡る。訳した文字列を返す */
  confirmation?: {
    bivarianceHack(args: z.output<Schema>): Confirmation;
  }["bivarianceHack"];
  /** サイトの関数（setter など）を呼ぶ。`args` は検証済み。`context` は実行する側（チャットなど）が渡すもの */
  run(
    args: z.output<Schema>,
    context: RunContext,
  ): void | RunResult | Promise<RunResult> | Promise<void>;
};

/**
 * AI の操作を見せる、押すふり・打ち込むふり。押す先は要素の id で指す
 * チャット（`@ai-friendly/assistant`）が実行するときはカーソルが動く。それ以外（WebMCP・テスト）では動きなしで、`type` は `write` に全部渡す
 * @see docs/commands.md
 */
export type Pointer = {
  click(id: string): Promise<void>;
  type(id: string, text: string, write: (value: string) => void): Promise<void>;
};

/** `run` の 2 つ目の引数。実行する側が渡す */
export type RunContext = { pointer: Pointer };

/** ツールを実行する側が渡せるもの（`AiTool.execute` の 2 つ目の引数） */
export type ExecuteOptions = { pointer?: Pointer };

/** 確認で見せる文言（ダイアログ・チャット内の確認ボタンなど） */
export type Confirmation = {
  title: string;
  description: string;
  confirmLabel: string;
};

/** 確認フックに渡す Command（`{ type, ...args }` の平らな形） */
export type Command = { type: string } & Record<string, unknown>;

/**
 * 確認が要る Command を実行してよいか尋ねる。承認したら `true`
 * `confirmation` は定義の `confirmation` が返した文言。定義になければ `undefined`
 */
export type ConfirmHandler = (
  command: Command,
  confirmation: Confirmation | undefined,
) => boolean | Promise<boolean>;

/**
 * - `invalid_command`: 引数の形が違う（未定義のフィールド・必須の欠け・型の違い）
 * - `rejected`: 確認で拒否された、または確認フックがない
 * - `domain_error`: `run` が失敗を返した
 */
export type ErrorCode = "invalid_command" | "rejected" | "domain_error";

export type ExecuteResult =
  | { ok: true; message?: string }
  | { ok: false; code: ErrorCode; message: string };
