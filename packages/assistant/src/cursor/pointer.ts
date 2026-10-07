import { clickOn, typeInto } from "./cursor";
import { findElement } from "./find-element";

/**
 * カーソルで押すふり・打ち込むふりをする。押す先は要素の id で指す
 * Command の run で、サイトの関数を呼ぶ前に待つ。テストでは一瞬で終わるものに差し替える
 * @see docs/assistant.md
 */
export const pointer = {
  click: async (id: string) => clickOn(await findElement(id)),
  type: async (id: string, text: string, write: (value: string) => void) =>
    typeInto(await findElement(id), text, write),
};

export type Pointer = typeof pointer;
