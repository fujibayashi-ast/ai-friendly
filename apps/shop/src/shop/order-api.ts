import type { CartItem } from "./shop";

let lastOrderNumber = 1000;

/** ダミーの注文 API。通信せず、少し待って注文番号を返す */
export async function submitOrder(
  _items: readonly CartItem[],
): Promise<{ orderNumber: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  lastOrderNumber += 1;
  return { orderNumber: String(lastOrderNumber) };
}
