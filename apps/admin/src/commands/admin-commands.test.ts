import { beforeEach, describe, expect, mock, test } from "bun:test";
import { type ConfirmHandler, createAiTools } from "@ai-friendly/command";
import { resetApi, shipOrder, updateStock } from "../admin/admin-api";
import { createQueryClient } from "../admin/queries";
import { createTranslate } from "../i18n/messages";
import { createAdminCommands } from "./admin-commands";

// ダミーの API はモジュールの中にデータを持つので、テストごとに最初に戻す
beforeEach(resetApi);

const setup = ({ confirm }: { confirm?: ConfirmHandler } = {}) => {
  const queryClient = createQueryClient();
  const actions = {
    navigate: mock((_: string) => {}),
    shipOrder: mock((id: number) => shipOrder(id)),
    updateStock: mock(({ id, stock }: { id: number; stock: number }) =>
      updateStock(id, stock),
    ),
  };
  const confirmMock = mock(confirm ?? (async () => true));
  const tools = createAiTools({
    commands: createAdminCommands({
      queryClient,
      ...actions,
      language: "en",
      t: createTranslate("en"),
    }),
    confirm: confirmMock,
  });
  const run = (name: string, input: unknown) =>
    tools.find((t) => t.name === name)?.execute(input);
  return { ...actions, queryClient, confirm: confirmMock, run };
};

describe("admin commands", () => {
  test("open pages with the same URLs as the screen, and tell what they show", async () => {
    const s = setup();
    expect(
      await s.run("show_orders", { status: "pending", query: " Watanabe " }),
    ).toEqual({
      ok: true,
      message:
        "show_orders: the order list now shows 1 orders: 1026 Sho Watanabe (pending)",
    });
    expect(await s.run("show_products", { max_stock: 2 })).toEqual({
      ok: true,
      message:
        "show_products: the product list now shows 3 products: 3 Cookie tin (stock 0), 6 Honey (stock 2), 12 Olive oil (stock 1)",
    });
    expect(await s.run("show_order", { order_id: 1026 })).toEqual({
      ok: true,
      message:
        "show_order: the order page now shows order 1026 (pending, Sho Watanabe): Mug x2; total 3600",
    });
    expect(s.navigate.mock.calls).toEqual([
      ["/orders?status=pending&q=Watanabe"],
      ["/products?max_stock=2"],
      ["/orders/1026"],
    ]);
    // ページと同じキーでキャッシュに入る（get_state はここを読む）
    expect(
      s.queryClient.getQueryData([
        "orders",
        { status: "pending", query: "Watanabe" },
      ]),
    ).toHaveLength(1);
  });

  test("do not open an order that does not exist", async () => {
    const s = setup();
    expect(await s.run("show_order", { order_id: 9999 })).toMatchObject({
      message: "show_order: order 9999 not found; use show_orders to search",
    });
    expect(s.navigate).not.toHaveBeenCalled();
  });

  test("mark as shipped after confirming, with the customer from the cache", async () => {
    const s = setup();
    await s.run("show_orders", { query: "Watanabe" });
    expect(await s.run("mark_order_shipped", { order_id: 1026 })).toEqual({
      ok: true,
    });
    expect(s.confirm.mock.calls[0]?.[1]).toMatchObject({
      description: "Order 1026 (Sho Watanabe) will be marked as shipped.",
    });
    expect(await s.run("mark_order_shipped", { order_id: 1026 })).toEqual({
      ok: false,
      code: "domain_error",
      message: "mark_order_shipped: order 1026 is already shipped",
    });
  });

  test("do not ship when the user declines", async () => {
    const s = setup({ confirm: async () => false });
    expect(await s.run("mark_order_shipped", { order_id: 1026 })).toMatchObject(
      { code: "rejected" },
    );
    expect(s.shipOrder).not.toHaveBeenCalled();
  });

  test("set the stock, and tell why the API refused", async () => {
    const s = setup();
    expect(await s.run("set_stock", { product_id: 3, stock: 10 })).toEqual({
      ok: true,
    });
    expect(
      await s.run("set_stock", { product_id: 3, stock: -1 }),
    ).toMatchObject({
      message: "set_stock: stock must be a whole number from 0 to 999",
    });
    expect(
      await s.run("set_stock", { product_id: 99, stock: 1 }),
    ).toMatchObject({
      message:
        "set_stock: product 99 not found; use show_products to find the id",
    });
  });
});
