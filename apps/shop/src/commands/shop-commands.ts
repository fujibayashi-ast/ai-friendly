import { defineCommand } from "@ai-friendly/command";
import { useMemo } from "react";
import { z } from "zod";
import { formatPrice } from "../i18n/format";
import type { Language, Translate } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";
import {
  cartTotal,
  categoryFilters,
  orderError,
  type ShopError,
  sortOrders,
} from "../shop/shop";
import {
  type ShopContextValue,
  type ShopResult,
  useShop,
} from "../shop/shop-context";

type ShopActions = Pick<
  ShopContextValue,
  | "state"
  | "setCategory"
  | "setOrder"
  | "addToCart"
  | "setCartQuantity"
  | "removeFromCart"
  | "placeOrder"
> & { language: Language; t: Translate };

export function createShopCommands({
  state,
  setCategory,
  setOrder,
  addToCart,
  setCartQuantity,
  removeFromCart,
  placeOrder,
  language,
  t,
}: ShopActions) {
  /** サイトの関数が返した理由を、AI が読んで直せる英文にする */
  const describe = (error: ShopError, id = "") => {
    switch (error.code) {
      case "ordering":
        return "an order is being placed; try again after it finishes";
      case "not_found":
        return `product "${id}" not found (ids: ${state.products.map((product) => product.id).join(", ")})`;
      case "coming_soon":
        return `product "${id}" is not on sale yet (release date: ${error.releaseDate})`;
      case "sold_out":
        return `product "${id}" is sold out`;
      case "over_stock":
        return `only ${error.stock} left for product "${id}"`;
      case "not_in_cart":
        return `product "${id}" is not in the cart (cart: ${state.cart.map((item) => item.productId).join(", ") || "empty"})`;
      case "invalid_quantity":
        return "quantity must be 1 or more";
      case "empty_cart":
        return "the cart is empty";
    }
  };
  const toRunResult = (result: ShopResult, id?: string) =>
    result.ok
      ? undefined
      : { ok: false as const, message: describe(result.error, id) };

  return [
    defineCommand({
      type: "set_category",
      description:
        "Show only the products in a category on the product list (all: every product).",
      args: z.object({ category: z.enum(categoryFilters) }),
      run: ({ category }) => setCategory(category),
    }),
    defineCommand({
      type: "sort_products",
      description:
        "Sort the product list (price_asc: cheapest first, price_desc: most expensive first).",
      args: z.object({ order: z.enum(sortOrders) }),
      run: ({ order }) => setOrder(order),
    }),
    defineCommand({
      type: "add_to_cart",
      description:
        "Add a product to the cart (adds to the quantity already in the cart).",
      args: z.object({
        product_id: z.string(),
        quantity: z.number().int().min(1),
      }),
      run: ({ product_id, quantity }) =>
        toRunResult(addToCart(product_id, quantity), product_id),
    }),
    defineCommand({
      type: "set_cart_quantity",
      description:
        "Change the quantity of a product that is already in the cart.",
      args: z.object({
        product_id: z.string(),
        quantity: z.number().int().min(1),
      }),
      run: ({ product_id, quantity }) =>
        toRunResult(setCartQuantity(product_id, quantity), product_id),
    }),
    defineCommand({
      type: "remove_from_cart",
      description: "Remove a product from the cart.",
      args: z.object({ product_id: z.string() }),
      run: ({ product_id }) =>
        toRunResult(removeFromCart(product_id), product_id),
    }),
    defineCommand({
      type: "place_order",
      description: "Place an order for everything in the cart.",
      args: z.object({}),
      // 空のカートは確認せずに知らせる
      requiresConfirmation: () => !orderError(state),
      confirmation: () => ({
        title: t("order.title"),
        description: t("order.description", {
          total: formatPrice(language, cartTotal(state)),
        }),
        confirmLabel: t("order.confirm"),
      }),
      run: async () => {
        const result = await placeOrder();
        return result.ok
          ? { ok: true, message: `order ${result.orderNumber} was placed` }
          : toRunResult(result);
      },
    }),
  ];
}

/** ネットショップの Command。サイトの useShop の関数を呼ぶ */
export function useShopCommands() {
  const {
    state,
    setCategory,
    setOrder,
    addToCart,
    setCartQuantity,
    removeFromCart,
    placeOrder,
  } = useShop();
  const { language, t } = useI18n();
  return useMemo(
    () =>
      createShopCommands({
        state,
        setCategory,
        setOrder,
        addToCart,
        setCartQuantity,
        removeFromCart,
        placeOrder,
        language,
        t,
      }),
    [
      state,
      setCategory,
      setOrder,
      addToCart,
      setCartQuantity,
      removeFromCart,
      placeOrder,
      language,
      t,
    ],
  );
}
