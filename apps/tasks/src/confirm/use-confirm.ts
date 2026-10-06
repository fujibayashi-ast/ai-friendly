import { createContext, useContext } from "react";
import type { MessageKey } from "../i18n/messages";

/** 文言は辞書のキーで渡す（確認中に言語が変わっても追従する） */
export type ConfirmOptions = {
  title: MessageKey;
  description: MessageKey;
  confirmLabel: MessageKey;
  /** `description` の `{name}` に入れる値 */
  values?: Record<string, string | number>;
};

export type Confirm = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<Confirm | null>(null);

/** 確認ダイアログを出し、承認されたら `true` を返す */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("ConfirmProvider がありません");
  return confirm;
}
