import { type ReactNode, useCallback, useMemo, useState } from "react";
import { submitOrder } from "./order-api";
import {
  addToCart,
  addToCartError,
  completeOrder,
  initialShopState,
  orderError,
  removeFromCart,
  removeFromCartError,
  type ShopError,
  setCartQuantity,
  setCartQuantityError,
  setCategory,
  setOrder,
  startOrder,
} from "./shop";
import { type OrderResult, ShopContext, type ShopResult } from "./shop-context";

/** 商品・表示・カートを持つ。保存はしない（再読み込みで最初に戻る） */
export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialShopState);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const display = useMemo(
    () => ({
      setCategory: (category: Parameters<typeof setCategory>[1]) =>
        setState((s) => setCategory(s, category)),
      setOrder: (order: Parameters<typeof setOrder>[1]) =>
        setState((s) => setOrder(s, order)),
    }),
    [],
  );

  // だめな理由は今の描画の state で判定し、変更は最新の state に重ねる（続けて呼ばれても片方が消えないように）
  const cart = useMemo(() => {
    const result = (error: ShopError | undefined): ShopResult =>
      error ? { ok: false, error } : { ok: true };
    return {
      addToCart: (id: string, quantity: number) => {
        const error = addToCartError(state, id, quantity);
        if (!error) {
          setOrderNumber(null);
          setState((s) => addToCart(s, id, quantity));
        }
        return result(error);
      },
      setCartQuantity: (id: string, quantity: number) => {
        const error = setCartQuantityError(state, id, quantity);
        if (!error) setState((s) => setCartQuantity(s, id, quantity));
        return result(error);
      },
      removeFromCart: (id: string) => {
        const error = removeFromCartError(state, id);
        if (!error) setState((s) => removeFromCart(s, id));
        return result(error);
      },
    };
  }, [state]);

  // 二重の注文は送信中の state で防ぐ（確実に防ぐのは本物では API の役目）
  const placeOrder = useCallback(async (): Promise<OrderResult> => {
    const error = orderError(state);
    if (error) return { ok: false, error };
    const items = state.cart;
    setState(startOrder);
    const response = await submitOrder(items);
    setState((s) => completeOrder(s, items));
    setOrderNumber(response.orderNumber);
    return { ok: true, orderNumber: response.orderNumber };
  }, [state]);

  const value = useMemo(
    () => ({ state, orderNumber, ...display, ...cart, placeOrder }),
    [state, orderNumber, display, cart, placeOrder],
  );
  return <ShopContext value={value}>{children}</ShopContext>;
}
