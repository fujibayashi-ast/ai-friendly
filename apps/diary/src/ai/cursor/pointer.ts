import { clickOn, typeInto } from "./cursor";
import { findClickable, findField } from "./find-target";

/** 押す先。ボタン・リンクは画面の文字、入力欄は `<label>` の文字で指す */
export type Target = { button: string } | { field: string };

const find = (target: Target) =>
  "button" in target ? findClickable(target.button) : findField(target.field);

/** カーソルで押すふり・打ち込むふりをする。Command はこれを受け取る（テストでは一瞬で終わるものに差し替える） */
export const pointer = {
  click: (target: Target) => clickOn(find(target)),
  type: (target: Target, text: string, write: (value: string) => void) =>
    typeInto(find(target), text, write),
};

export type Pointer = typeof pointer;
