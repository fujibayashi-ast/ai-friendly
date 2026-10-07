import type { Language } from "../i18n/messages";
import type { Order, OrderItem, OrderStatus, Product } from "./data";

export const orderStatuses = [
  "pending",
  "shipped",
] as const satisfies readonly OrderStatus[];

export type AdminState = {
  orders: readonly Order[];
  products: readonly Product[];
};

export type OrderFilters = { status?: OrderStatus; query?: string };
export type ProductFilters = { maxStock?: number };

/** 在庫に入れられる数 */
export const maxStock = 999;

export function findOrder(state: AdminState, id: number): Order | undefined {
  return state.orders.find((order) => order.id === id);
}

export function findProduct(
  state: AdminState,
  id: number,
): Product | undefined {
  return state.products.find((product) => product.id === id);
}

export function itemSubtotal(state: AdminState, item: OrderItem): number {
  return (findProduct(state, item.productId)?.price ?? 0) * item.quantity;
}

export function orderTotal(state: AdminState, order: Order): number {
  return order.items.reduce((sum, item) => sum + itemSubtotal(state, item), 0);
}

/** 新しい順。状態と、お客さまの名前（ja / en のどちらでも）・注文番号で絞り込む */
export function filterOrders(
  state: AdminState,
  { status, query }: OrderFilters,
): Order[] {
  const words = query?.trim().toLowerCase().split(/\s+/).filter(Boolean) ?? [];
  return state.orders
    .filter((order) => !status || order.status === status)
    .filter((order) => {
      const text = [String(order.id), order.customer.ja, order.customer.en]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, "");
      return words.every((word) => text.includes(word));
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

export function filterProducts(
  state: AdminState,
  { maxStock }: ProductFilters,
): Product[] {
  return state.products.filter(
    (product) => maxStock === undefined || product.stock <= maxStock,
  );
}

/** 注文・在庫を変えられない理由。画面と AI のどちらから呼ばれても、同じ判定で断る */
export type AdminError =
  | { code: "order_not_found" }
  | { code: "already_shipped" }
  | { code: "product_not_found" }
  | { code: "invalid_stock" };

export function markShippedError(
  state: AdminState,
  id: number,
): AdminError | undefined {
  const order = findOrder(state, id);
  if (!order) return { code: "order_not_found" };
  if (order.status === "shipped") return { code: "already_shipped" };
}

export function setStockError(
  state: AdminState,
  id: number,
  stock: number,
): AdminError | undefined {
  if (!findProduct(state, id)) return { code: "product_not_found" };
  if (!Number.isInteger(stock) || stock < 0 || stock > maxStock) {
    return { code: "invalid_stock" };
  }
}

export function markShipped(state: AdminState, id: number): AdminState {
  if (markShippedError(state, id)) return state;
  return {
    ...state,
    orders: state.orders.map((order) =>
      order.id === id ? { ...order, status: "shipped" } : order,
    ),
  };
}

export function setStock(
  state: AdminState,
  id: number,
  stock: number,
): AdminState {
  if (setStockError(state, id, stock)) return state;
  return {
    ...state,
    products: state.products.map((product) =>
      product.id === id ? { ...product, stock } : product,
    ),
  };
}

export function itemName(
  state: AdminState,
  productId: number,
  language: Language,
): string {
  return findProduct(state, productId)?.name[language] ?? String(productId);
}
