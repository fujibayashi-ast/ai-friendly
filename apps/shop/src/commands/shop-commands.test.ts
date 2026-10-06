import { describe, expect, mock, test } from "bun:test";
import { type ConfirmHandler, createAiTools } from "@ai-friendly/command";
import { createTranslate } from "../i18n/messages";
import {
  addToCart,
  initialShopState,
  type ShopState,
  startOrder,
} from "../shop/shop";
import { createShopCommands } from "./shop-commands";

const setup = ({
  state = initialShopState,
  confirm,
}: {
  state?: ShopState;
  confirm?: ConfirmHandler;
} = {}) => {
  const actions = {
    setCategory: mock(() => {}),
    setOrder: mock(() => {}),
    addToCart: mock((_: string, __: number) => {}),
    setCartQuantity: mock((_: string, __: number) => {}),
    removeFromCart: mock((_: string) => {}),
    placeOrder: mock(async () => {}),
  };
  const confirmMock = mock(confirm ?? (async () => true));
  const tools = createAiTools({
    commands: createShopCommands({
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

const withHoney = addToCart(initialShopState, "6", 1);

describe("shop commands", () => {
  test("change the list", async () => {
    const s = setup();
    expect(await s.run("set_category", { category: "food" })).toEqual({
      ok: true,
    });
    expect(await s.run("sort_products", { order: "price_asc" })).toEqual({
      ok: true,
    });
    expect(s.setCategory).toHaveBeenCalledWith("food");
    expect(s.setOrder).toHaveBeenCalledWith("price_asc");
  });

  test("add to the cart with the quantity", async () => {
    const s = setup();
    expect(
      await s.run("add_to_cart", { product_id: "1", quantity: 2 }),
    ).toEqual({ ok: true });
    expect(s.addToCart).toHaveBeenCalledWith("1", 2);
    // 数を落として呼び直すことがあるので、省略させない
    expect(await s.run("add_to_cart", { product_id: "1" })).toMatchObject({
      code: "invalid_command",
    });
  });

  test("explain why a product cannot be added", async () => {
    const s = setup({ state: withHoney });
    const cases: [unknown, string][] = [
      [
        { product_id: "3", quantity: 1 },
        'add_to_cart: product "3" is sold out',
      ],
      [
        { product_id: "5", quantity: 1 },
        'add_to_cart: product "5" is not on sale yet (release date: 2026-11-20)',
      ],
      [
        { product_id: "6", quantity: 2 },
        'add_to_cart: only 2 left for product "6"',
      ],
      [
        { product_id: "9", quantity: 1 },
        'add_to_cart: product "9" not found (ids: 1, 2, 3, 4, 5, 6, 7, 8)',
      ],
    ];
    for (const [input, message] of cases) {
      expect(await s.run("add_to_cart", input)).toEqual({
        ok: false,
        code: "domain_error",
        message,
      });
    }
    expect(s.addToCart).not.toHaveBeenCalled();
  });

  test("do not set the quantity of a product that is not in the cart", async () => {
    const s = setup();
    expect(
      await s.run("set_cart_quantity", { product_id: "2", quantity: 1 }),
    ).toMatchObject({
      message:
        'set_cart_quantity: product "2" is not in the cart (cart: empty)',
    });
    expect(s.addToCart).not.toHaveBeenCalled();
    expect(s.setCartQuantity).not.toHaveBeenCalled();
  });

  test("change and remove only what is in the cart", async () => {
    const s = setup({ state: withHoney });
    expect(
      await s.run("set_cart_quantity", { product_id: "6", quantity: 2 }),
    ).toEqual({ ok: true });
    expect(
      await s.run("set_cart_quantity", { product_id: "6", quantity: 3 }),
    ).toMatchObject({
      message: 'set_cart_quantity: only 2 left for product "6"',
    });
    expect(await s.run("remove_from_cart", { product_id: "1" })).toMatchObject({
      message: 'remove_from_cart: product "1" is not in the cart (cart: 6)',
    });
    expect(await s.run("remove_from_cart", { product_id: "6" })).toEqual({
      ok: true,
    });
    expect(s.setCartQuantity.mock.calls).toEqual([["6", 2]]);
    expect(s.removeFromCart.mock.calls).toEqual([["6"]]);
  });

  test("order after confirming the total", async () => {
    const s = setup({ state: withHoney });
    expect(await s.run("place_order", {})).toEqual({ ok: true });
    expect(s.confirm.mock.calls[0]?.[1]).toMatchObject({
      description: "Your order totaling ¥1,680 will be placed.",
    });
    expect(s.placeOrder).toHaveBeenCalledTimes(1);

    const declined = setup({ state: withHoney, confirm: async () => false });
    expect(await declined.run("place_order", {})).toMatchObject({
      code: "rejected",
    });
    expect(declined.placeOrder).not.toHaveBeenCalled();
  });

  test("refuse cart changes and orders while an order is being placed", async () => {
    const s = setup({ state: startOrder(withHoney) });
    const message = "an order is being placed; try again after it finishes";
    for (const [name, input] of [
      ["add_to_cart", { product_id: "1", quantity: 1 }],
      ["set_cart_quantity", { product_id: "6", quantity: 2 }],
      ["remove_from_cart", { product_id: "6" }],
      ["place_order", {}],
    ] as const) {
      expect(await s.run(name, input)).toEqual({
        ok: false,
        code: "domain_error",
        message: `${name}: ${message}`,
      });
    }
    expect(s.confirm).not.toHaveBeenCalled();
    expect(s.addToCart).not.toHaveBeenCalled();
    expect(s.placeOrder).not.toHaveBeenCalled();
    expect(await s.run("set_category", { category: "food" })).toEqual({
      ok: true,
    });
  });

  test("tell without asking when the cart is empty", async () => {
    const s = setup();
    expect(await s.run("place_order", {})).toEqual({
      ok: false,
      code: "domain_error",
      message: "place_order: the cart is empty",
    });
    expect(s.confirm).not.toHaveBeenCalled();
  });
});
