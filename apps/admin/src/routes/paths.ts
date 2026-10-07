import {
  type OrderFilters,
  orderStatuses,
  type ProductFilters,
} from "../admin/admin";

/**
 * ページの URL を作る・読む。絞り込みは URL の検索条件に入れる
 * 画面のリンク・絞り込みと、ページ遷移の Command が同じ関数を使う
 */
export function ordersPath({ status, query }: OrderFilters = {}): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (query?.trim()) params.set("q", query.trim());
  return withParams("/orders", params);
}

export function orderPath(id: number): string {
  return `/orders/${id}`;
}

export function productsPath({ maxStock }: ProductFilters = {}): string {
  const params = new URLSearchParams();
  if (maxStock !== undefined) params.set("max_stock", String(maxStock));
  return withParams("/products", params);
}

export function readOrderFilters(params: URLSearchParams): OrderFilters {
  const status = orderStatuses.find((value) => value === params.get("status"));
  const query = params.get("q") ?? undefined;
  return { status, query };
}

export function readProductFilters(params: URLSearchParams): ProductFilters {
  const text = params.get("max_stock") ?? "";
  const value = Number(text);
  const valid = text !== "" && Number.isInteger(value) && value >= 0;
  return { maxStock: valid ? value : undefined };
}

function withParams(path: string, params: URLSearchParams): string {
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}
