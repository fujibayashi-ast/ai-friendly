import { type ReactNode, useMemo, useState } from "react";
import {
  type AdminError,
  type AdminState,
  markShipped,
  markShippedError,
  setStock,
  setStockError,
} from "./admin";
import { AdminContext, type AdminResult } from "./admin-context";
import { initialOrders, initialProducts } from "./data";

const initialState: AdminState = {
  orders: initialOrders,
  products: initialProducts,
};

/** 注文・商品を持つ。ルーターより上に置き、どのページからも同じ関数を呼べるようにする。保存はしない */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  // だめな理由は今の描画の state で判定し、変更は最新の state に重ねる（続けて呼ばれても片方が消えないように）
  const value = useMemo(() => {
    const result = (error: AdminError | undefined): AdminResult =>
      error ? { ok: false, error } : { ok: true };
    return {
      state,
      markShipped: (id: string) => {
        const error = markShippedError(state, id);
        if (!error) setState((s) => markShipped(s, id));
        return result(error);
      },
      setStock: (id: string, stock: number) => {
        const error = setStockError(state, id, stock);
        if (!error) setState((s) => setStock(s, id, stock));
        return result(error);
      },
    };
  }, [state]);

  return <AdminContext value={value}>{children}</AdminContext>;
}
