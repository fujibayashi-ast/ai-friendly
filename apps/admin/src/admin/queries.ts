import {
  QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { OrderFilters, ProductFilters } from "./admin";
import {
  ApiError,
  fetchOrder,
  fetchOrders,
  fetchProducts,
  shipOrder,
  updateStock,
} from "./admin-api";

/**
 * 取得のキーと関数。画面（useQuery）と AI の層（fetchQuery・getQueryData）が同じものを使い、キャッシュを共有する
 */
export const ordersQuery = (filters: OrderFilters) =>
  queryOptions({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrders(filters),
  });

export const orderQuery = (id: number) =>
  queryOptions({ queryKey: ["order", id], queryFn: () => fetchOrder(id) });

export const productsQuery = (filters: ProductFilters) =>
  queryOptions({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  });

/** API が断ったとき（存在しないなど）は、何度試しても同じなので取り直さない */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (count, error) => !(error instanceof ApiError) && count < 3,
      },
    },
  });
}

/** 発送済みにする。終わったら注文の一覧・詳細を取り直す */
export function useShipOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shipOrder,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order"] }),
      ]),
  });
}

/** 在庫を変える。終わったら商品の一覧を取り直す */
export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      updateStock(id, stock),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
