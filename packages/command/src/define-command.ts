import type { ArgsSchema, CommandDefinition } from "./types";

/**
 * Command を定義する。`args`（zod のオブジェクト）から `run` の引数の型を推論する
 *
 * @example
 * const setLanguageCommand = defineCommand({
 *   type: "set_language",
 *   description: "Change the display language.",
 *   args: z.object({ language: z.enum(["ja", "en"]) }),
 *   run: ({ language }) => setLanguage(language),
 * });
 * @see docs/commands.md
 */
export function defineCommand<
  const Type extends string,
  Schema extends ArgsSchema,
>(
  definition: CommandDefinition<Type, Schema>,
): CommandDefinition<Type, Schema> {
  return definition;
}
