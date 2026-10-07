import { describe, expect, test } from "bun:test";
import {
  orderPath,
  ordersPath,
  productsPath,
  readOrderFilters,
  readProductFilters,
} from "./paths";

const params = (path: string) => new URLSearchParams(path.split("?")[1] ?? "");

describe("paths", () => {
  test("put filters in the URL and read them back", () => {
    const path = ordersPath({ status: "pending", query: " 佐藤 " });
    expect(path).toBe("/orders?status=pending&q=%E4%BD%90%E8%97%A4");
    expect(readOrderFilters(params(path))).toEqual({
      status: "pending",
      query: "佐藤",
    });
    expect(ordersPath()).toBe("/orders");
    expect(orderPath("1001")).toBe("/orders/1001");
    expect(productsPath({ maxStock: 5 })).toBe("/products?max_stock=5");
    expect(readProductFilters(params("/products?max_stock=5"))).toEqual({
      maxStock: 5,
    });
  });

  test("ignore values that are not filters", () => {
    expect(readOrderFilters(params("?status=lost"))).toEqual({
      status: undefined,
      query: undefined,
    });
    expect(readProductFilters(params("?max_stock=-1"))).toEqual({
      maxStock: undefined,
    });
    expect(readProductFilters(params("?max_stock="))).toEqual({
      maxStock: undefined,
    });
  });
});
