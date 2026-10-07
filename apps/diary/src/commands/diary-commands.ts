import { defineCommand } from "@ai-friendly/command";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { type Pointer, pointer } from "../ai/cursor/pointer";
import {
  type Draft,
  type DraftField,
  missingFields,
  weathers,
} from "../diary/diary";
import { type DiaryContextValue, useDiary } from "../diary/diary-context";
import { useSaveEntry } from "../diary/use-save-entry";
import type { Translate } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";

type DiaryActions = Pick<DiaryContextValue, "draft" | "setDraftField"> & {
  /** React Router の navigate（画面のリンクと同じ） */
  navigate(path: string): void;
  /** 画面の「保存」と同じ（保存できたら一覧へ戻る） */
  saveEntry: ReturnType<typeof useSaveEntry>;
  /** 今のページ（`/` か `/new`） */
  currentPath(): string;
  /** カーソルで押すふり・打ち込むふり */
  pointer: Pointer;
  t: Translate;
};

export function createDiaryCommands({
  draft,
  setDraftField,
  navigate,
  saveEntry,
  currentPath,
  pointer,
  t,
}: DiaryActions) {
  const done = (message: string) => ({ ok: true as const, message });
  const fail = (message: string) => ({ ok: false as const, message });
  const labels: Record<DraftField, string> = {
    date: t("newEntry.date"),
    weather: t("newEntry.weather"),
    title: t("newEntry.title.label"),
    body: t("newEntry.body"),
  };

  /** 一覧の「書く」を押して、書くページへ（もういれば何もしない） */
  const openWritePage = async () => {
    if (currentPath() === "/new") return;
    await pointer.click({ button: t("entries.write") });
    navigate("/new");
    // 書くページが描かれてから、入力欄を探す
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  return [
    defineCommand({
      type: "open_new_entry",
      description: "Open the page to write a new diary entry.",
      args: z.object({}),
      run: async () => {
        await openWritePage();
        return done("the writing page is open; fill it in with fill_entry");
      },
    }),
    defineCommand({
      type: "fill_entry",
      description:
        "Write the diary entry on the writing page (opens it if needed). Pass only the fields to change (date: YYYY-MM-DD; weather: sunny, cloudy, rainy or snowy; title; body).",
      args: z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        weather: z.enum(weathers).optional(),
        title: z.string().optional(),
        body: z.string().optional(),
      }),
      run: async (input) => {
        await openWritePage();
        const { date, weather, title, body } = input;
        // 画面の上から順に入れる
        if (date !== undefined) {
          await pointer.click({ field: labels.date });
          setDraftField("date", date);
        }
        if (weather !== undefined) {
          await pointer.click({ button: t(`weather.${weather}`) });
          setDraftField("weather", weather);
        }
        for (const field of ["title", "body"] as const) {
          const text = input[field];
          if (text === undefined) continue;
          await pointer.type({ field: labels[field] }, text, (value) =>
            setDraftField(field, value),
          );
        }
        const next: Draft = {
          date: date ?? draft.date,
          weather: weather ?? draft.weather,
          title: title ?? draft.title,
          body: body ?? draft.body,
        };
        const missing = missingFields(next);
        return done(
          missing.length > 0
            ? `filled in; not saved yet. still missing: ${missing.join(", ")}`
            : "filled in; not saved yet. every field is filled, so save it now unless the user wants changes",
        );
      },
    }),
    defineCommand({
      type: "save_entry",
      description: "Save the diary entry on the writing page.",
      args: z.object({}),
      run: async () => {
        if (currentPath() !== "/new") {
          return fail("the writing page is not open; use fill_entry first");
        }
        await pointer.click({ button: t("newEntry.save") });
        const result = saveEntry();
        return result.ok
          ? done("saved; the list now shows the entry at the top")
          : fail(`not saved; missing: ${result.missing.join(", ")}`);
      },
    }),
  ];
}

/** 今のページ。呼ばれたときの URL から読む（移った直後でも新しいページを返す） */
function currentPath() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return window.location.pathname.slice(base.length) || "/";
}

/** 日記の Command。サイトの useDiary の関数と、React Router の navigate を呼ぶ */
export function useDiaryCommands() {
  const { draft, setDraftField } = useDiary();
  const navigate = useNavigate();
  const saveEntry = useSaveEntry();
  const { t } = useI18n();
  return useMemo(
    () =>
      createDiaryCommands({
        draft,
        setDraftField,
        navigate,
        saveEntry,
        currentPath,
        pointer,
        t,
      }),
    [draft, setDraftField, navigate, saveEntry, t],
  );
}
