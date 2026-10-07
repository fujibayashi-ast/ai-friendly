import type { Pointer } from "./types";

/** 動きなし。押すふりはすぐ終わり、打ち込みは全部まとめて渡す */
export const noPointer: Pointer = {
  click: async () => {},
  type: async (_id, text, write) => write(text),
};
