import { type ReactNode, useCallback, useMemo, useState } from "react";
import { type Entry, emptyDraft, isWeather, missingFields } from "./diary";
import { DiaryContext, type SaveResult } from "./diary-context";
import { initialEntries } from "./entries";

const localToday = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** 日記と書きかけを持つ。保存はしない（再読み込みで最初に戻る） */
export function DiaryProvider({ children }: { children: ReactNode }) {
  const [today] = useState(localToday);
  const [entries, setEntries] = useState<readonly Entry[]>(initialEntries);
  const [draft, setDraft] = useState(() => emptyDraft(today));

  const setDraftField = useCallback(
    (field: keyof typeof draft, value: string) => {
      if (field === "weather" && value !== "" && !isWeather(value)) return;
      setDraft((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const save = useCallback((): SaveResult => {
    const missing = missingFields(draft);
    if (missing.length > 0) return { ok: false, missing };
    // 型を絞るため（空の天気は missingFields で断っている）
    if (draft.weather === "") return { ok: false, missing: ["weather"] };
    const id = Math.max(0, ...entries.map((entry) => entry.id)) + 1;
    const entry: Entry = {
      id,
      date: draft.date,
      weather: draft.weather,
      title: draft.title.trim(),
      body: draft.body.trim(),
    };
    setEntries((current) => [...current, entry]);
    setDraft(emptyDraft(today));
    return { ok: true, id };
  }, [draft, entries, today]);

  const value = useMemo(
    () => ({ today, entries, draft, setDraftField, save }),
    [today, entries, draft, setDraftField, save],
  );
  return <DiaryContext value={value}>{children}</DiaryContext>;
}
