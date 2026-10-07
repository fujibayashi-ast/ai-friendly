import {
  type AdminState,
  filterOrders,
  filterProducts,
  findOrder,
  itemName,
  orderTotal,
} from "../admin/admin";
import type { Language } from "../i18n/messages";
import type { CurrentPage } from "../routes/paths";

/** AI に見せる今のページ。画面に見えている行だけを返す */
export function pageState(
  state: AdminState,
  current: CurrentPage,
  language: Language,
) {
  switch (current.page) {
    case "orders": {
      const { status, query } = current.filters;
      return {
        page: "orders",
        filters: { status: status ?? "all", query: query ?? "" },
        orders: filterOrders(state, current.filters).map((order) => ({
          id: order.id,
          date: order.date,
          customer: order.customer[language],
          total: orderTotal(state, order),
          status: order.status,
        })),
      };
    }
    case "order": {
      const order = findOrder(state, current.id);
      if (!order) return { page: "order", order: null };
      return {
        page: "order",
        order: {
          id: order.id,
          date: order.date,
          customer: order.customer[language],
          items: order.items.map((item) => ({
            product_id: item.productId,
            name: itemName(state, item.productId, language),
            quantity: item.quantity,
          })),
          total: orderTotal(state, order),
          status: order.status,
        },
      };
    }
    case "products":
      return {
        page: "products",
        filters: { max_stock: current.filters.maxStock ?? null },
        products: filterProducts(state, current.filters).map((product) => ({
          id: product.id,
          name: product.name[language],
          price: product.price,
          stock: product.stock,
        })),
      };
    case "other":
      return { page: "other" };
  }
}
