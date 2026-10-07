import { beforeEach, describe, expect, test } from "bun:test";
import {
  ApiError,
  fetchOrder,
  fetchOrders,
  fetchProducts,
  resetApi,
  shipOrder,
  updateStock,
} from "./admin-api";

beforeEach(resetApi);

describe("dummy API", () => {
  test("return only the requested page", async () => {
    const orders = await fetchOrders({ status: "pending", query: "小林" });
    expect(orders.map((order) => order.id)).toEqual([1025, 1005]);
    expect(orders[0]).toMatchObject({
      customer: { ja: "小林 葵" },
      total: 1760,
    });
    const order = await fetchOrder(1026);
    expect(order.items).toEqual([
      {
        productId: 2,
        name: { ja: "マグカップ", en: "Mug" },
        quantity: 2,
        subtotal: 3600,
      },
    ]);
    expect((await fetchProducts({ maxStock: 2 })).map((p) => p.id)).toEqual([
      3, 6, 12,
    ]);
  });

  test("change the data, and refuse with a reason", async () => {
    await shipOrder(1026);
    expect((await fetchOrder(1026)).status).toBe("shipped");
    await expect(shipOrder(1026)).rejects.toEqual(
      new ApiError({ code: "already_shipped" }),
    );
    await expect(fetchOrder(9999)).rejects.toBeInstanceOf(ApiError);
    await updateStock(6, 10);
    expect((await fetchProducts({ maxStock: 2 })).map((p) => p.id)).toEqual([
      3, 12,
    ]);
    await expect(updateStock(6, -1)).rejects.toMatchObject({
      error: { code: "invalid_stock" },
    });
  });
});
