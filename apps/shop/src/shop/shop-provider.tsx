import { type ReactNode, useCallback, useMemo, useState } from "react";
import { submitOrder } from "./order-api";
import {
  addToCart,
  completeOrder,
  initialShopState,
  removeFromCart,
  setCartQuantity,
  setCategory,
  setOrder,
  startOrder,
} from "./shop";
import { ShopContext } from "./shop-context";

/** 商品・表示・カートを持つ。保存はしない（再読み込みで最初に戻る） */
export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialShopState);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const actions = useMemo(
    () => ({
      setCategory: (category: Parameters<typeof setCategory>[1]) =>
        setState((s) => setCategory(s, category)),
      setOrder: (order: Parameters<typeof setOrder>[1]) =>
        setState((s) => setOrder(s, order)),
      addToCart: (id: string, quantity: number) => {
        setOrderNumber(null);
        setState((s) => addToCart(s, id, quantity));
      },
      setCartQuantity: (id: string, quantity: number) =>
        setState((s) => setCartQuantity(s, id, quantity)),
      removeFromCart: (id: string) => setState((s) => removeFromCart(s, id)),
    }),
    [],
  );

  const { cart, ordering } = state;
  // 二重の注文は送信中の state で防ぐ（確実に防ぐのは本物では API の役目）
  const placeOrder = useCallback(async () => {
    if (ordering || cart.length === 0) return;
    setState(startOrder);
    const result = await submitOrder(cart);
    setState((s) => completeOrder(s, cart));
    setOrderNumber(result.orderNumber);
  }, [cart, ordering]);

  const value = useMemo(
    () => ({ state, orderNumber, ...actions, placeOrder }),
    [state, orderNumber, actions, placeOrder],
  );
  return <ShopContext value={value}>{children}</ShopContext>;
}
