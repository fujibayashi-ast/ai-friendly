import type { Confirmation } from "@ai-friendly/command";
import { createContext, useContext } from "react";

/** 文言は Command の `confirmation` が訳したものを受け取る */
export type Confirm = (confirmation: Confirmation) => Promise<boolean>;

export const ConfirmContext = createContext<Confirm | null>(null);

/** 確認ダイアログを出し、承認されたら `true` を返す */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("ConfirmProvider がありません");
  return confirm;
}
