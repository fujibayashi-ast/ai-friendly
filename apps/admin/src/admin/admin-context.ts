import { createContext, useContext } from "react";
import type { AdminError, AdminState } from "./admin";

/** 注文・在庫を変えたときの結果。画面は使わなくてよい */
export type AdminResult = { ok: true } | { ok: false; error: AdminError };

export type AdminContextValue = {
  state: AdminState;
  markShipped(id: string): AdminResult;
  setStock(id: string, stock: number): AdminResult;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error("AdminProvider がありません");
  return value;
}
