export type Entry = {
  id: number;
  title: string;
  body: string;
};

/** 書きかけ。書いていない項目は空文字 */
export type Draft = {
  title: string;
  body: string;
};

export const draftFields = ["title", "body"] as const;
export type DraftField = (typeof draftFields)[number];

export const emptyDraft = (): Draft => ({ title: "", body: "" });

/** 新しい順 */
export function sortEntries(entries: readonly Entry[]): Entry[] {
  return [...entries].sort((a, b) => b.id - a.id);
}

/** 保存できない理由（空の項目）。画面と AI のどちらから保存しても同じ判定で断る */
export function missingFields(draft: Draft): DraftField[] {
  return draftFields.filter((field) => draft[field].trim() === "");
}
