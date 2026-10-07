/**
 * 押す先・入力欄を、画面に出ている名前で探す（Playwright の getByRole / getByLabel と同じ考え）
 * サイト側に AI のための目印を足さないため
 */
const clickable = "button, a[href], [role='button'], [role='radio']";

const nameOf = (element: Element) =>
  (element.getAttribute("aria-label") ?? element.textContent ?? "").trim();

/** 名前が `name` を含む、押せる部品 */
export function findClickable(name: string): HTMLElement | null {
  for (const element of document.querySelectorAll<HTMLElement>(clickable)) {
    if (nameOf(element).includes(name)) return element;
  }
  return null;
}

/** `<label>` の文字が `label` の入力欄 */
export function findField(label: string): HTMLElement | null {
  for (const element of document.querySelectorAll("label")) {
    if (element.textContent?.trim() === label) {
      return element.htmlFor ? document.getElementById(element.htmlFor) : null;
    }
  }
  return null;
}
