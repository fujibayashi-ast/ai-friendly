/**
 * AI の操作を見せる仮のマウスカーソル。押すふり・打ち込むふりをするだけで、実際の DOM にイベントは送らない
 * 動きの間に何度も描き直さないよう、React ではなく DOM を直接動かす
 */

const size = 28;
const moveMs = 500;
const clickMs = 250;
/** 打ち込みの全体の長さの上限（長い本文は 1 文字あたりを短くする） */
const typeMaxMs = 4000;
const typeCharMs = 45;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let element: HTMLDivElement | null = null;

function cursorElement(): HTMLDivElement {
  if (element?.isConnected) return element;
  element = document.createElement("div");
  element.setAttribute("aria-hidden", "true");
  Object.assign(element.style, {
    position: "fixed",
    left: "0",
    top: "0",
    zIndex: "2147483647",
    pointerEvents: "none",
    // 最初は画面の右下（チャットのあたり）から出てくる
    transform: `translate(${window.innerWidth - 80}px, ${window.innerHeight - 80}px)`,
    transition: `transform ${moveMs}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms`,
    opacity: "0",
  });
  element.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M4 2.5v17.2l4.6-4.2 2.9 6.3 3-1.4-2.9-6.2h6.3z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  document.body.append(element);
  return element;
}

/** 対象の真ん中より少し左上を指す */
function pointOf(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  return {
    x: rect.left + Math.min(rect.width / 2, 24),
    y: rect.top + Math.min(rect.height / 2, 16),
  };
}

async function moveTo(target: HTMLElement) {
  const cursor = cursorElement();
  cursor.style.opacity = "1";
  // 画面の外なら、見えるところまでスクロールしてから動く
  const rect = target.getBoundingClientRect();
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    await sleep(400);
  }
  const { x, y } = pointOf(target);
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  await sleep(moveMs);
}

/** クリックした印（広がって消える輪） */
async function ripple() {
  const cursor = cursorElement();
  const ring = document.createElement("span");
  Object.assign(ring.style, {
    position: "absolute",
    left: "-14px",
    top: "-14px",
    width: "28px",
    height: "28px",
    borderRadius: "9999px",
    border: "3px solid var(--primary)",
    transition: `transform ${clickMs}ms ease-out, opacity ${clickMs}ms ease-out`,
  });
  cursor.prepend(ring);
  requestAnimationFrame(() => {
    ring.style.transform = "scale(1.8)";
    ring.style.opacity = "0";
  });
  await sleep(clickMs);
  ring.remove();
}

/** 対象へ動いて押すふりをする。終わってから、呼んだ側がサイトの関数を呼ぶ */
export async function clickOn(target: HTMLElement | null) {
  if (!target || reducedMotion()) return;
  await moveTo(target);
  await ripple();
}

/**
 * 入力欄を押してから、1 文字ずつ `write` に渡す（人が打つと 1 文字ごとに onChange が呼ばれるのと同じ）
 * 対象がない・動きを減らす設定のときは、全部まとめて渡す
 */
export async function typeInto(
  target: HTMLElement | null,
  text: string,
  write: (value: string) => void,
) {
  if (!target || reducedMotion()) {
    write(text);
    return;
  }
  await clickOn(target);
  target.focus({ preventScroll: true });
  // 打った文字に重ならないよう、入力欄の右下へよける
  const rect = target.getBoundingClientRect();
  cursorElement().style.transform = `translate(${rect.right - 32}px, ${rect.bottom - 28}px)`;
  const chars = [...text];
  const delay = Math.min(typeCharMs, typeMaxMs / Math.max(chars.length, 1));
  for (let i = 0; i <= chars.length; i++) {
    write(chars.slice(0, i).join(""));
    await sleep(delay);
  }
}

/** 操作が終わったらカーソルを隠す */
export function hideCursor() {
  if (element) element.style.opacity = "0";
}
