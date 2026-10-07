import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
  type DraftField,
  type Entry,
  emptyDraft,
  missingFields,
} from "./diary";
import { DiaryContext, type SaveResult } from "./diary-context";
import { initialEntries } from "./entries";

/** 日記と書きかけを持つ。保存はしない（再読み込みで最初に戻る） */
export function DiaryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<readonly Entry[]>(initialEntries);
  const [draft, setDraft] = useState(emptyDraft);

  const setDraftField = useCallback((field: DraftField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  }, []);

  const save = useCallback((): SaveResult => {
    const missing = missingFields(draft);
    if (missing.length > 0) return { ok: false, missing };
    const id = Math.max(0, ...entries.map((entry) => entry.id)) + 1;
    const entry: Entry = {
      id,
      title: draft.title.trim(),
      body: draft.body.trim(),
    };
    setEntries((current) => [...current, entry]);
    setDraft(emptyDraft());
    return { ok: true, id };
  }, [draft, entries]);

  const value = useMemo(
    () => ({ entries, draft, setDraftField, save }),
    [entries, draft, setDraftField, save],
  );
  return <DiaryContext value={value}>{children}</DiaryContext>;
}
