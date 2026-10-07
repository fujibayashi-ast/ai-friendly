import type { Pointer } from "@ai-friendly/command";
import { clickOn, hideCursor, typeInto } from "./cursor";
import { findElement } from "./find-element";
import { hideWhenIdle } from "./hide-when-idle";

/** カーソルで押すふり・打ち込むふりをする。チャットがツールの実行に渡す */
export const pointer: Pointer = {
  click: async (id: string) => clickOn(await findElement(id)),
  type: async (id: string, text: string, write: (value: string) => void) =>
    typeInto(await findElement(id), text, write),
};

/** WebMCP にはチャットの「返事の終わり」がないので、操作が止まってしばらくしたらカーソルを隠す */
const webMcpIdleMs = 2000;

/**
 * WebMCP の登録（`registerWebMcpTools`）に渡す、カーソルで見せる `pointer`
 * チャットと同じ動きで、操作が 2 秒止まったらカーソルを隠す
 * @see docs/assistant.md
 */
export const webMcpPointer: Pointer = hideWhenIdle(
  pointer,
  hideCursor,
  webMcpIdleMs,
);
