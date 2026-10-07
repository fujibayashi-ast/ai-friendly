import type { Language } from "../i18n/messages";
import {
  type AdminError,
  type AdminState,
  filterOrders,
  filterProducts,
  findOrder,
  findProduct,
  itemSubtotal,
  markShipped,
  markShippedError,
  type OrderFilters,
  orderTotal,
  type ProductFilters,
  setStock,
  setStockError,
} from "./admin";
import {
  initialOrders,
  initialProducts,
  type OrderStatus,
  type Product,
} from "./data";

/** API が断ったときのエラー。`error.code` で理由がわかる（本物では 404 / 409 / 422 など） */
export class ApiError extends Error {
  constructor(readonly error: AdminError) {
    super(error.code);
    this.name = "ApiError";
  }
}

export type OrderSummary = {
  id: number;
  date: string;
  customer: Record<Language, string>;
  total: number;
  status: OrderStatus;
};

export type OrderDetail = OrderSummary & {
  items: {
    productId: number;
    name: Record<Language, string>;
    quantity: number;
    subtotal: number;
  }[];
};

const initialState: AdminState = {
  orders: initialOrders,
  products: initialProducts,
};

// サーバーの役。再読み込みで最初に戻る
let db = initialState;

/** 通信の代わりに少し待つ */
const wait = () => new Promise((resolve) => setTimeout(resolve, 300));

const summary = (order: (typeof initialOrders)[number]): OrderSummary => ({
  id: order.id,
  date: order.date,
  customer: order.customer,
  total: orderTotal(db, order),
  status: order.status,
});

/** ダミーの API。通信せず、少し待ってから、そのページの分だけを返す */
export async function fetchOrders(
  filters: OrderFilters,
): Promise<OrderSummary[]> {
  await wait();
  return filterOrders(db, filters).map(summary);
}

export async function fetchOrder(id: number): Promise<OrderDetail> {
  await wait();
  const order = findOrder(db, id);
  if (!order) throw new ApiError({ code: "order_not_found" });
  return {
    ...summary(order),
    items: order.items.map((item) => ({
      productId: item.productId,
      name: findProduct(db, item.productId)?.name ?? { ja: "", en: "" },
      quantity: item.quantity,
      subtotal: itemSubtotal(db, item),
    })),
  };
}

export async function fetchProducts(
  filters: ProductFilters,
): Promise<Product[]> {
  await wait();
  return filterProducts(db, filters);
}

export async function shipOrder(id: number): Promise<void> {
  await wait();
  const error = markShippedError(db, id);
  if (error) throw new ApiError(error);
  db = markShipped(db, id);
}

export async function updateStock(id: number, stock: number): Promise<void> {
  await wait();
  const error = setStockError(db, id, stock);
  if (error) throw new ApiError(error);
  db = setStock(db, id, stock);
}

/** テストで、データを最初に戻す */
export function resetApi() {
  db = initialState;
}
