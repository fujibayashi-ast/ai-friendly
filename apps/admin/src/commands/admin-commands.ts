import { defineCommand } from "@ai-friendly/command";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import {
  type AdminError,
  filterOrders,
  filterProducts,
  findOrder,
  itemName,
  markShippedError,
  orderStatuses,
  orderTotal,
} from "../admin/admin";
import {
  type AdminContextValue,
  type AdminResult,
  useAdmin,
} from "../admin/admin-context";
import type { Language, Translate } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";
import { orderPath, ordersPath, productsPath } from "../routes/paths";

type AdminActions = Pick<
  AdminContextValue,
  "state" | "markShipped" | "setStock"
> & {
  /** React Router の navigate（画面のリンク・絞り込みと同じ） */
  navigate(path: string): void;
  language: Language;
  t: Translate;
};

export function createAdminCommands({
  state,
  markShipped,
  setStock,
  navigate,
  language,
  t,
}: AdminActions) {
  const done = (message: string) => ({ ok: true as const, message });
  /** サイトの関数が返した理由を、AI が読んで直せる英文にする */
  const describe = (error: AdminError, id: string | number) => {
    switch (error.code) {
      case "order_not_found":
        return `order "${id}" not found; use show_orders to search`;
      case "already_shipped":
        return `order "${id}" is already shipped`;
      case "product_not_found":
        return `product "${id}" not found (ids: ${state.products.map((product) => product.id).join(", ")})`;
      case "invalid_stock":
        return "stock must be a whole number from 0 to 999";
    }
  };
  const toRunResult = (result: AdminResult, id: string | number) =>
    result.ok
      ? undefined
      : { ok: false as const, message: describe(result.error, id) };

  return [
    defineCommand({
      type: "show_orders",
      description:
        "Open the order list, filtered by status (pending: not shipped) and by a customer name or order number in query.",
      args: z.object({
        status: z.enum(orderStatuses).optional(),
        query: z.string().optional(),
      }),
      run: (filters) => {
        navigate(ordersPath(filters));
        // 小さいモデルは get_state を読まずに番号を作りがちなので、開いたページに見えているものも短く伝える
        const orders = filterOrders(state, filters);
        const list = orders
          .map(
            (order) =>
              `${order.id} ${order.customer[language]} (${order.status})`,
          )
          .join(", ");
        return done(
          `the order list now shows ${orders.length} orders${list ? `: ${list}` : ""}`,
        );
      },
    }),
    defineCommand({
      type: "show_order",
      description: "Open the page of one order.",
      args: z.object({ order_id: z.number().int() }),
      run: ({ order_id }) => {
        const order = findOrder(state, order_id);
        // 画面にもない注文へのリンクはないので、開かずに知らせる
        if (!order) {
          return {
            ok: false,
            message: describe({ code: "order_not_found" }, order_id),
          };
        }
        navigate(orderPath(order_id));
        const items = order.items
          .map(
            (item) =>
              `${itemName(state, item.productId, language)} x${item.quantity}`,
          )
          .join(", ");
        return done(
          `the order page now shows order ${order_id} (${order.status}, ${order.customer[language]}): ${items}; total ${orderTotal(state, order)}`,
        );
      },
    }),
    defineCommand({
      type: "show_products",
      description:
        "Open the product list, optionally only products with max_stock or fewer in stock.",
      args: z.object({ max_stock: z.number().int().min(0).optional() }),
      run: ({ max_stock }) => {
        const filters = { maxStock: max_stock };
        navigate(productsPath(filters));
        const products = filterProducts(state, filters);
        const list = products
          .map(
            (product) =>
              `${product.id} ${product.name[language]} (stock ${product.stock})`,
          )
          .join(", ");
        return done(
          `the product list now shows ${products.length} products${list ? `: ${list}` : ""}`,
        );
      },
    }),
    defineCommand({
      type: "mark_order_shipped",
      description: "Mark an order as shipped.",
      args: z.object({ order_id: z.number().int() }),
      // 見つからない・発送済みは確認せずに知らせる
      requiresConfirmation: ({ order_id }) =>
        !markShippedError(state, order_id),
      confirmation: ({ order_id }) => ({
        title: t("ship.title"),
        description: t("ship.description", {
          id: order_id,
          customer: findOrder(state, order_id)?.customer[language] ?? "",
        }),
        confirmLabel: t("ship.confirm"),
      }),
      run: ({ order_id }) => toRunResult(markShipped(order_id), order_id),
    }),
    defineCommand({
      type: "set_stock",
      description: "Set the stock of a product.",
      args: z.object({
        product_id: z.number().int(),
        stock: z.number().int(),
      }),
      run: ({ product_id, stock }) =>
        toRunResult(setStock(product_id, stock), product_id),
    }),
  ];
}

/** 管理画面の Command。サイトの useAdmin の関数と、React Router の navigate を呼ぶ */
export function useAdminCommands() {
  const { state, markShipped, setStock } = useAdmin();
  const navigate = useNavigate();
  const { language, t } = useI18n();
  return useMemo(
    () =>
      createAdminCommands({
        state,
        markShipped,
        setStock,
        navigate,
        language,
        t,
      }),
    [state, markShipped, setStock, navigate, language, t],
  );
}
