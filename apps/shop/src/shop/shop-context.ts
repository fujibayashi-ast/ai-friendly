import { createContext, useContext } from "react";
import type { CategoryFilter, ShopError, ShopState, SortOrder } from "./shop";

/** カートを変えた・注文したときの結果。画面は使わなくてよい */
export type ShopResult = { ok: true } | { ok: false; error: ShopError };
export type OrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: ShopError };

export type ShopContextValue = {
  state: ShopState;
  /** 直前の注文の番号。カートを変えると消える */
  orderNumber: string | null;
  setCategory(category: CategoryFilter): void;
  setOrder(order: SortOrder): void;
  addToCart(id: string, quantity: number): ShopResult;
  setCartQuantity(id: string, quantity: number): ShopResult;
  removeFromCart(id: string): ShopResult;
  placeOrder(): Promise<OrderResult>;
};

export const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const value = useContext(ShopContext);
  if (!value) throw new Error("ShopProvider がありません");
  return value;
}
