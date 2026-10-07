import { defineCommand } from "@ai-friendly/command";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { type AdminError, orderStatuses } from "../admin/admin";
import {
  ApiError,
  type OrderDetail,
  type OrderSummary,
} from "../admin/admin-api";
import {
  orderQuery,
  ordersQuery,
  productsQuery,
  useShipOrder,
  useUpdateStock,
} from "../admin/queries";
import type { Language, Translate } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";
import {
  orderPath,
  ordersPath,
  paramsOf,
  productsPath,
  readOrderFilters,
  readProductFilters,
} from "../routes/paths";

type AdminActions = {
  /** 画面と同じキャッシュ。ページと同じキーで取る */
  queryClient: QueryClient;
  /** React Router の navigate（画面のリンク・絞り込みと同じ） */
  navigate(path: string): void;
  /** 画面のボタンと同じ mutation */
  shipOrder(id: number): Promise<void>;
  updateStock(input: { id: number; stock: number }): Promise<void>;
  language: Language;
  t: Translate;
};

export function createAdminCommands({
  queryClient,
  navigate,
  shipOrder,
  updateStock,
  language,
  t,
}: AdminActions) {
  const done = (message: string) => ({ ok: true as const, message });
  const fail = (message: string) => ({ ok: false as const, message });
  /** API が返した理由を、AI が読んで直せる英文にする */
  const describe = (error: AdminError, id: number) => {
    switch (error.code) {
      case "order_not_found":
        return `order ${id} not found; use show_orders to search`;
      case "already_shipped":
        return `order ${id} is already shipped`;
      case "product_not_found":
        return `product ${id} not found; use show_products to find the id`;
      case "invalid_stock":
        return "stock must be a whole number from 0 to 999";
    }
  };
  /** API に断られたら理由を返す。それ以外の失敗（通信など）はそのまま投げる */
  const call = async (request: Promise<unknown>, id: number) => {
    try {
      await request;
    } catch (error) {
      if (error instanceof ApiError) return fail(describe(error.error, id));
      throw error;
    }
  };
  /** 確認の文言用。取ってきた注文のキャッシュからお客さまを探す */
  const cachedCustomer = (id: number) => {
    const detail = queryClient.getQueryData(orderQuery(id).queryKey);
    if (detail) return detail.customer[language];
    for (const [, orders] of queryClient.getQueriesData<OrderSummary[]>({
      queryKey: ["orders"],
    })) {
      const order = orders?.find((item) => item.id === id);
      if (order) return order.customer[language];
    }
  };

  return [
    defineCommand({
      type: "show_orders",
      description:
        "Open the order list, filtered by status (pending: not shipped) and by a customer name or order number in query.",
      args: z.object({
        status: z.enum(orderStatuses).optional(),
        query: z.string().optional(),
      }),
      run: async (input) => {
        const path = ordersPath(input);
        navigate(path);
        // ページと同じキーで、届くのを待つ（取得はページと共有する）
        const orders = await queryClient.fetchQuery(
          ordersQuery(readOrderFilters(paramsOf(path))),
        );
        // 小さいモデルは get_state を読まずに番号を作りがちなので、開いたページに見えているものも短く伝える
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
      run: async ({ order_id }) => {
        // 画面にもない注文へのリンクはないので、取れなければ開かずに知らせる
        let order: OrderDetail;
        try {
          order = await queryClient.fetchQuery(orderQuery(order_id));
        } catch (error) {
          if (error instanceof ApiError) {
            return fail(describe(error.error, order_id));
          }
          throw error;
        }
        navigate(orderPath(order_id));
        const items = order.items
          .map((item) => `${item.name[language]} x${item.quantity}`)
          .join(", ");
        return done(
          `the order page now shows order ${order_id} (${order.status}, ${order.customer[language]}): ${items}; total ${order.total}`,
        );
      },
    }),
    defineCommand({
      type: "show_products",
      description:
        "Open the product list, optionally only products with max_stock or fewer in stock.",
      args: z.object({ max_stock: z.number().int().min(0).optional() }),
      run: async ({ max_stock }) => {
        const path = productsPath({ maxStock: max_stock });
        navigate(path);
        const products = await queryClient.fetchQuery(
          productsQuery(readProductFilters(paramsOf(path))),
        );
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
      // 発送済みかどうかは API にしかわからないので、いつも確認する（断られたら理由を返す）
      requiresConfirmation: true,
      confirmation: ({ order_id }) => {
        const name = cachedCustomer(order_id);
        return {
          title: t("ship.title"),
          description: t("ship.description", {
            id: order_id,
            customer: name ? t("ship.customer", { name }) : "",
          }),
          confirmLabel: t("ship.confirm"),
        };
      },
      run: ({ order_id }) => call(shipOrder(order_id), order_id),
    }),
    defineCommand({
      type: "set_stock",
      description: "Set the stock of a product.",
      args: z.object({
        product_id: z.number().int(),
        stock: z.number().int(),
      }),
      run: ({ product_id, stock }) =>
        call(updateStock({ id: product_id, stock }), product_id),
    }),
  ];
}

/** 管理画面の Command。画面と同じ取得（TanStack Query）・mutation と、React Router の navigate を呼ぶ */
export function useAdminCommands() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutateAsync: shipOrder } = useShipOrder();
  const { mutateAsync: updateStock } = useUpdateStock();
  const { language, t } = useI18n();
  return useMemo(
    () =>
      createAdminCommands({
        queryClient,
        navigate,
        shipOrder,
        updateStock,
        language,
        t,
      }),
    [queryClient, navigate, shipOrder, updateStock, language, t],
  );
}
