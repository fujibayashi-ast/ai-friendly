import { defineCommand } from "@ai-friendly/command";
import { useMemo } from "react";
import { z } from "zod";
import { formatPrice } from "../i18n/format";
import type { Language, Translate } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";
import {
  cartQuantity,
  cartTotal,
  categoryFilters,
  findProduct,
  productStatus,
  sortOrders,
} from "../shop/shop";
import { type ShopContextValue, useShop } from "../shop/shop-context";

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
  const fail = (message: string) => ({ ok: false as const, message });
  const notFound = (id: string) =>
    fail(
      `product "${id}" not found (ids: ${state.products.map((product) => product.id).join(", ")})`,
    );
  const notInCart = (id: string) =>
    fail(
      `product "${id}" is not in the cart (cart: ${state.cart.map((item) => item.productId).join(", ") || "empty"})`,
    );
  // 画面のボタンと同じく、注文の送信中はカートと注文を受け付けない（サイトの関数も何もしない）
  const busy = () =>
    state.ordering
      ? fail("an order is being placed; try again after it finishes")
      : undefined;
  /** 販売中で、カートの分と合わせて在庫に収まるか。だめなら理由を返す */
  const checkStock = (id: string, quantity: number) => {
    const product = findProduct(state, id);
    if (!product) return notFound(id);
    const status = productStatus(product);
    if (status === "coming_soon") {
      return fail(
        `product "${id}" is not on sale yet (release date: ${product.releaseDate})`,
      );
    }
    if (status === "sold_out") return fail(`product "${id}" is sold out`);
    if (quantity > product.stock) {
      return fail(`only ${product.stock} left for product "${id}"`);
    }
  };

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
      run: ({ product_id, quantity }) => {
        const error =
          busy() ??
          checkStock(product_id, cartQuantity(state, product_id) + quantity);
        if (error) return error;
        addToCart(product_id, quantity);
      },
    }),
    defineCommand({
      type: "set_cart_quantity",
      description:
        "Change the quantity of a product that is already in the cart.",
      args: z.object({
        product_id: z.string(),
        quantity: z.number().int().min(1),
      }),
      run: ({ product_id, quantity }) => {
        const error = busy();
        if (error) return error;
        if (cartQuantity(state, product_id) === 0) return notInCart(product_id);
        const stockError = checkStock(product_id, quantity);
        if (stockError) return stockError;
        setCartQuantity(product_id, quantity);
      },
    }),
    defineCommand({
      type: "remove_from_cart",
      description: "Remove a product from the cart.",
      args: z.object({ product_id: z.string() }),
      run: ({ product_id }) => {
        const error = busy();
        if (error) return error;
        if (cartQuantity(state, product_id) === 0) return notInCart(product_id);
        removeFromCart(product_id);
      },
    }),
    defineCommand({
      type: "place_order",
      description: "Place an order for everything in the cart.",
      args: z.object({}),
      // 空のカートは確認せずに知らせる
      requiresConfirmation: () => !state.ordering && state.cart.length > 0,
      confirmation: () => ({
        title: t("order.title"),
        description: t("order.description", {
          total: formatPrice(language, cartTotal(state)),
        }),
        confirmLabel: t("order.confirm"),
      }),
      run: async () => {
        const error = busy();
        if (error) return error;
        if (state.cart.length === 0) return fail("the cart is empty");
        await placeOrder();
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
