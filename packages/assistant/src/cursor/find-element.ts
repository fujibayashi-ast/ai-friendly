const waitMs = 1000;
const intervalMs = 50;

/** id の要素。ページを移った直後で、まだ描かれていなければ少し待つ。出てこなければ null */
export async function findElement(id: string): Promise<HTMLElement | null> {
  const deadline = Date.now() + waitMs;
  for (;;) {
    const element = document.getElementById(id);
    if (element || Date.now() >= deadline) return element;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
