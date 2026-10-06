import { createContext, useContext } from "react";
import type { CategoryFilter, ShopState, SortOrder } from "./shop";

export type ShopContextValue = {
  state: ShopState;
  /** 注文の送信中 */
  ordering: boolean;
  /** 直前の注文の番号。カートを変えると消える */
  orderNumber: string | null;
  setCategory(category: CategoryFilter): void;
  setOrder(order: SortOrder): void;
  addToCart(id: string, quantity: number): void;
  setCartQuantity(id: string, quantity: number): void;
  removeFromCart(id: string): void;
  placeOrder(): Promise<void>;
};

export const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const value = useContext(ShopContext);
  if (!value) throw new Error("ShopProvider がありません");
  return value;
}
