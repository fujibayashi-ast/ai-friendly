import type { CommandDefinition } from "../types";

/** ツールの説明の末尾に付ける、確認が要るかの印 */
export function confirmationMark(definition: CommandDefinition): string {
  const rule = definition.requiresConfirmation;
  if (typeof rule === "function") return " [may ask the user to confirm]";
  return rule ? " [asks the user to confirm]" : "";
}
