import type { Pointer } from "@ai-friendly/command";
import { clickOn, typeInto } from "./cursor";
import { findElement } from "./find-element";

/** カーソルで押すふり・打ち込むふりをする。チャットがツールの実行に渡す */
export const pointer: Pointer = {
  click: async (id: string) => clickOn(await findElement(id)),
  type: async (id: string, text: string, write: (value: string) => void) =>
    typeInto(await findElement(id), text, write),
};
