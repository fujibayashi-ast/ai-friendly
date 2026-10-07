import type { QueryClient } from "@tanstack/react-query";
import { orderQuery, ordersQuery, productsQuery } from "../admin/queries";
import type { Language } from "../i18n/messages";
import type { CurrentPage } from "../routes/paths";

/** AI に見せる今のページ。ページが取ってきた分（画面に出ている分）のキャッシュを返す */
export function pageState(
  queryClient: QueryClient,
  current: CurrentPage,
  language: Language,
) {
  switch (current.page) {
    case "orders": {
      const { status, query } = current.filters;
      const orders = queryClient.getQueryData(
        ordersQuery(current.filters).queryKey,
      );
      return {
        page: "orders",
        filters: { status: status ?? "all", query: query ?? "" },
        orders:
          orders?.map((order) => ({
            ...order,
            customer: order.customer[language],
          })) ?? "loading",
      };
    }
    case "order": {
      const order = queryClient.getQueryData(orderQuery(current.id).queryKey);
      return {
        page: "order",
        order: order
          ? {
              ...order,
              customer: order.customer[language],
              items: order.items.map((item) => ({
                product_id: item.productId,
                name: item.name[language],
                quantity: item.quantity,
                subtotal: item.subtotal,
              })),
            }
          : null,
      };
    }
    case "products": {
      const products = queryClient.getQueryData(
        productsQuery(current.filters).queryKey,
      );
      return {
        page: "products",
        filters: { max_stock: current.filters.maxStock ?? null },
        products:
          products?.map((product) => ({
            ...product,
            name: product.name[language],
          })) ?? "loading",
      };
    }
    case "other":
      return { page: "other" };
  }
}
