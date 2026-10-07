import { createContext, useContext } from "react";
import type { Draft, DraftField, Entry } from "./diary";

/** 保存したときの結果。画面は使わなくてよい */
export type SaveResult =
  | { ok: true; id: number }
  | { ok: false; missing: DraftField[] };

export type DiaryContextValue = {
  entries: readonly Entry[];
  draft: Draft;
  /** 書きかけの項目を変える（入力欄の 1 文字ごとにも呼ばれる） */
  setDraftField(field: DraftField, value: string): void;
  /** 書きかけを日記にする。空の項目があれば断り、その項目を返す */
  save(): SaveResult;
};

export const DiaryContext = createContext<DiaryContextValue | null>(null);

export function useDiary(): DiaryContextValue {
  const value = useContext(DiaryContext);
  if (!value) throw new Error("DiaryProvider がありません");
  return value;
}
