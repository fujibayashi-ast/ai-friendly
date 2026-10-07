import type { Pointer } from "@ai-friendly/command";

/** 押す・打ち込むが終わってから `idleMs` 操作がなければ `hide` を呼ぶ。次の操作が始まったら取りやめる */
export function hideWhenIdle(
  base: Pointer,
  hide: () => void,
  idleMs: number,
): Pointer {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const run = async (action: () => Promise<void>) => {
    clearTimeout(timer);
    try {
      await action();
    } finally {
      timer = setTimeout(hide, idleMs);
    }
  };
  return {
    click: (id) => run(() => base.click(id)),
    type: (id, text, write) => run(() => base.type(id, text, write)),
  };
}
