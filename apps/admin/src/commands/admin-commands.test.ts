import { describe, expect, mock, test } from "bun:test";
import { type ConfirmHandler, createAiTools } from "@ai-friendly/command";
import {
  type AdminError,
  type AdminState,
  markShipped,
  markShippedError,
  setStockError,
} from "../admin/admin";
import { initialOrders, initialProducts } from "../admin/data";
import { createTranslate } from "../i18n/messages";
import { createAdminCommands } from "./admin-commands";

const initial: AdminState = {
  orders: initialOrders,
  products: initialProducts,
};

const setup = ({
  state = initial,
  confirm,
}: {
  state?: AdminState;
  confirm?: ConfirmHandler;
} = {}) => {
  // サイトの関数と同じ判定で結果を返す
  const result = (error: AdminError | undefined) =>
    error ? { ok: false as const, error } : { ok: true as const };
  const actions = {
    navigate: mock((_: string) => {}),
    markShipped: mock((id: number) => result(markShippedError(state, id))),
    setStock: mock((id: number, stock: number) =>
      result(setStockError(state, id, stock)),
    ),
  };
  const confirmMock = mock(confirm ?? (async () => true));
  const tools = createAiTools({
    commands: createAdminCommands({
      state,
      ...actions,
      language: "en",
      t: createTranslate("en"),
    }),
    confirm: confirmMock,
  });
  const run = (name: string, input: unknown) =>
    tools.find((t) => t.name === name)?.execute(input);
  return { ...actions, confirm: confirmMock, run };
};

describe("admin commands", () => {
  test("open pages with the same URLs as the screen", async () => {
    const s = setup();
    expect(
      await s.run("show_orders", { status: "pending", query: "Watanabe" }),
    ).toEqual({
      ok: true,
      message:
        "show_orders: the order list now shows 1 orders: 1026 Sho Watanabe (pending)",
    });
    expect(await s.run("show_products", { max_stock: 5 })).toMatchObject({
      message:
        "show_products: the product list now shows 6 products: 3 Cookie tin (stock 0), 5 Fountain pen (stock 3), 6 Honey (stock 2), 7 Wooden cutting board (stock 5), 10 Dish cloths (set of 3) (stock 4), 12 Olive oil (stock 1)",
    });
    expect(await s.run("show_order", { order_id: 1026 })).toEqual({
      ok: true,
      message:
        "show_order: the order page now shows order 1026 (pending, Sho Watanabe): Mug x2; total 3600",
    });
    expect(s.navigate.mock.calls).toEqual([
      ["/orders?status=pending&q=Watanabe"],
      ["/products?max_stock=5"],
      ["/orders/1026"],
    ]);
  });

  test("do not open an order that does not exist", async () => {
    const s = setup();
    expect(await s.run("show_order", { order_id: 9999 })).toMatchObject({
      message: 'show_order: order "9999" not found; use show_orders to search',
    });
    expect(s.navigate).not.toHaveBeenCalled();
  });

  test("mark as shipped after confirming", async () => {
    const s = setup();
    expect(await s.run("mark_order_shipped", { order_id: 1026 })).toEqual({
      ok: true,
    });
    expect(s.confirm.mock.calls[0]?.[1]).toMatchObject({
      description: "Order 1026 (Sho Watanabe) will be marked as shipped.",
    });
    expect(s.markShipped).toHaveBeenCalledWith(1026);
  });

  test("tell without asking when the order cannot be shipped", async () => {
    const s = setup({ state: markShipped(initial, 1026) });
    expect(await s.run("mark_order_shipped", { order_id: 1026 })).toEqual({
      ok: false,
      code: "domain_error",
      message: 'mark_order_shipped: order "1026" is already shipped',
    });
    expect(await s.run("mark_order_shipped", { order_id: 1 })).toMatchObject({
      message:
        'mark_order_shipped: order "1" not found; use show_orders to search',
    });
    expect(s.confirm).not.toHaveBeenCalled();
  });

  test("set the stock", async () => {
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
        'set_stock: product "99" not found (ids: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)',
    });
  });
});
