export type CommandSource = "user" | "ai";

export type ArgSchema =
  | { type: "string"; description?: string; enum?: readonly string[] }
  | { type: "number"; description?: string }
  | { type: "integer"; description?: string }
  | { type: "boolean"; description?: string }
  | { type: "array"; description?: string; items: ArgSchema }
  | ObjectSchema;

export type ObjectSchema = {
  type: "object";
  description?: string;
  properties: Readonly<Record<string, ArgSchema>>;
  required?: readonly string[];
};

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

export type ApplyResult<State> =
  | { ok: true; state: State }
  | { ok: false; message: string };

export type CommandDefinition<
  State,
  Type extends string = string,
  Args = Record<string, unknown>,
> = {
  type: Type;
  description: string;
  args: ObjectSchema;
  requiresConfirmation?: boolean;
  apply(state: State, args: Args): ApplyResult<State>;
};

export type CommandOf<D> =
  D extends CommandDefinition<infer _S, infer T, infer A>
    ? Simplify<{ type: T } & A>
    : never;

export type Command = { type: string } & Record<string, unknown>;

export type ErrorCode =
  | "invalid_command"
  | "domain_error"
  | "rejected"
  | "nothing_to_undo"
  | "nothing_to_redo";

export type ExecuteResult =
  | { ok: true }
  | { ok: false; code: ErrorCode; message: string };

export type HistoryEntry = {
  commands: readonly Command[];
  source: CommandSource;
};
