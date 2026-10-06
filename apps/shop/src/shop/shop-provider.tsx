import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { submitOrder } from "./order-api";
import {
  addToCart,
  completeOrder,
  initialShopState,
  removeFromCart,
  setCartQuantity,
  setCategory,
  setOrder,
} from "./shop";
import { ShopContext } from "./shop-context";

/** 商品・表示・カートを持つ。保存はしない（再読み込みで最初に戻る） */
export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialShopState);
  const [ordering, setOrdering] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  // 画面のボタンと同じく、注文の送信中はカートと注文を受け付けない
  // state の反映を待たずに続けて呼ばれても止められるよう、ref でも持つ
  const orderingRef = useRef(false);

  const actions = useMemo(
    () => ({
      setCategory: (category: Parameters<typeof setCategory>[1]) =>
        setState((s) => setCategory(s, category)),
      setOrder: (order: Parameters<typeof setOrder>[1]) =>
        setState((s) => setOrder(s, order)),
      addToCart: (id: string, quantity: number) => {
        if (orderingRef.current) return;
        setOrderNumber(null);
        setState((s) => addToCart(s, id, quantity));
      },
      setCartQuantity: (id: string, quantity: number) => {
        if (orderingRef.current) return;
        setState((s) => setCartQuantity(s, id, quantity));
      },
      removeFromCart: (id: string) => {
        if (orderingRef.current) return;
        setState((s) => removeFromCart(s, id));
      },
    }),
    [],
  );

  const { cart } = state;
  const placeOrder = useCallback(async () => {
    if (orderingRef.current || cart.length === 0) return;
    orderingRef.current = true;
    setOrdering(true);
    try {
      const result = await submitOrder(cart);
      setState((s) => completeOrder(s, cart));
      setOrderNumber(result.orderNumber);
    } finally {
      orderingRef.current = false;
      setOrdering(false);
    }
  }, [cart]);

  const value = useMemo(
    () => ({ state, ordering, orderNumber, ...actions, placeOrder }),
    [state, ordering, orderNumber, actions, placeOrder],
  );
  return <ShopContext value={value}>{children}</ShopContext>;
}
