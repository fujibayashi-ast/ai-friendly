/** Command の発行元。`"ai"` のときだけ確認フック（`requiresConfirmation`）が働く */
export type CommandSource = "user" | "ai";

/**
 * 引数の定義（JSON Schema のサブセット）
 * 同じ定義を、検証・WebMCP の `inputSchema`・AI 向けのツール説明に使う
 * @see docs/commands.md
 */
export type ArgSchema =
  | { type: "string"; description?: string; enum?: readonly string[] }
  | { type: "number"; description?: string }
  | { type: "integer"; description?: string }
  | { type: "boolean"; description?: string }
  | { type: "array"; description?: string; items: ArgSchema }
  | ObjectSchema;

/** `required` にない項目は省略可になる */
export type ObjectSchema = {
  type: "object";
  description?: string;
  properties: Readonly<Record<string, ArgSchema>>;
  required?: readonly string[];
};

/** `ArgSchema` が表す値の TS の型 */
export type InferArg<S> = S extends {
  type: "string";
  enum: readonly (infer E)[];
}
  ? E
  : S extends { type: "string" }
    ? string
    : S extends { type: "number" | "integer" }
      ? number
      : S extends { type: "boolean" }
        ? boolean
        : S extends { type: "array"; items: infer I }
          ? InferArg<I>[]
          : S extends { type: "object"; properties: infer P }
            ? InferObject<
                P,
                S extends { required: readonly (infer R)[] } ? R : never
              >
            : never;

type InferObject<P, R> = Simplify<
  { [K in keyof P & R]: InferArg<P[K]> } & {
    [K in Exclude<keyof P, R>]?: InferArg<P[K]>;
  }
>;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * `apply` の戻り値
 * ドメイン上のエラー（存在しない ID など）は `{ ok: false, message }` で返す
 * `message` は LLM が読んで直せる英文にする
 */
export type ApplyResult<State> =
  | { ok: true; state: State }
  | { ok: false; message: string };

export type CommandDefinition<
  State,
  Type extends string = string,
  Args = Record<string, unknown>,
> = {
  /** snake_case の動詞始まり（`add_todo`） */
  type: Type;
  /** 何をするか（英文）。AI 向けのツール説明に使う */
  description: string;
  args: ObjectSchema;
  /** `true` なら、発行元が `"ai"` のときに確認フックで承認を得てから実行する */
  requiresConfirmation?: boolean;
  /**
   * 新しい状態を返す。`state` は書き換えない
   * ID などは Command 側で受け取り、ここで生成しない（同じ Command 列なら同じ結果にするため）
   */
  apply(state: State, args: Args): ApplyResult<State>;
};

/** 定義から求めた、`execute` に渡す Command の型（`{ type, ...args }`） */
export type CommandOf<D> =
  D extends CommandDefinition<infer _S, infer T, infer A>
    ? Simplify<{ type: T } & A>
    : never;

/** 型を特定しない Command（`{ type, ...args }` の平らな形） */
export type Command = { type: string } & Record<string, unknown>;

/**
 * - `invalid_command`: 形が違う（未定義の Command・フィールド、型の違い）
 * - `domain_error`: `apply` が失敗した
 * - `rejected`: 確認で拒否された、または確認フックがない
 * - `nothing_to_undo` / `nothing_to_redo`: 戻せる / やり直せる履歴がない
 */
export type ErrorCode =
  | "invalid_command"
  | "domain_error"
  | "rejected"
  | "nothing_to_undo"
  | "nothing_to_redo";

export type ExecuteResult =
  | { ok: true }
  | { ok: false; code: ErrorCode; message: string };

/** 実行したバッチ 1 つ分の記録 */
export type HistoryEntry = {
  commands: readonly Command[];
  source: CommandSource;
};
