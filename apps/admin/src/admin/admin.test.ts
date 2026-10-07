import { describe, expect, test } from "bun:test";
import {
  type AdminState,
  filterOrders,
  filterProducts,
  markShipped,
  markShippedError,
  orderTotal,
  setStock,
  setStockError,
} from "./admin";
import { initialOrders, initialProducts } from "./data";

const state: AdminState = { orders: initialOrders, products: initialProducts };
const ids = (orders: { id: string }[]) => orders.map((order) => order.id);

describe("orders", () => {
  test("newest first, filtered by status and by name in either language", () => {
    expect(filterOrders(state, {})[0]?.id).toBe("1030");
    const pending = filterOrders(state, { status: "pending" });
    expect(pending.every((order) => order.status === "pending")).toBe(true);
    expect(ids(filterOrders(state, { query: "佐藤" }))).toEqual(
      ids(filterOrders(state, { query: "hanako SATO" })),
    );
    expect(
      ids(filterOrders(state, { query: "佐藤花子" })).length,
    ).toBeGreaterThan(0);
    expect(ids(filterOrders(state, { query: "1005" }))).toEqual(["1005"]);
  });

  test("total from the item prices", () => {
    const order = initialOrders[0];
    if (!order) throw new Error("no order");
    // 1001: ドリップコーヒー ×1 + A5 ノート ×1
    expect(orderTotal(state, order)).toBe(1280 + 480);
  });

  test("mark as shipped only a pending order", () => {
    const pending = filterOrders(state, { status: "pending" })[0];
    if (!pending) throw new Error("no pending order");
    const next = markShipped(state, pending.id);
    expect(next.orders.find((order) => order.id === pending.id)?.status).toBe(
      "shipped",
    );
    expect(markShippedError(next, pending.id)).toEqual({
      code: "already_shipped",
    });
    expect(markShippedError(state, "9999")).toEqual({
      code: "order_not_found",
    });
    expect(markShipped(next, pending.id)).toBe(next);
  });
});

describe("products", () => {
  test("filter by stock", () => {
    expect(ids(filterProducts(state, { maxStock: 2 }))).toEqual([
      "3",
      "6",
      "12",
    ]);
    expect(filterProducts(state, {})).toHaveLength(12);
  });

  test("set the stock between 0 and 999", () => {
    expect(setStock(state, "3", 10).products[2]?.stock).toBe(10);
    expect(setStockError(state, "3", -1)).toEqual({ code: "invalid_stock" });
    expect(setStockError(state, "3", 1.5)).toEqual({ code: "invalid_stock" });
    expect(setStockError(state, "99", 1)).toEqual({
      code: "product_not_found",
    });
    expect(setStock(state, "3", 1000)).toBe(state);
  });
});
