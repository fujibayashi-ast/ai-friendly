import { defineCommand, type Pointer } from "@ai-friendly/command";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { type Draft, missingFields } from "../diary/diary";
import { type DiaryContextValue, useDiary } from "../diary/diary-context";
import { useSaveEntry } from "../diary/use-save-entry";
import { elementIds } from "../pages/element-ids";

type DiaryActions = Pick<DiaryContextValue, "draft" | "setDraftField"> & {
  /** React Router の navigate（画面のリンクと同じ） */
  navigate(path: string): void;
  /** 画面の「保存」と同じ（保存できたら一覧へ戻る） */
  saveEntry: ReturnType<typeof useSaveEntry>;
  /** 今のページ（`/` か `/new`） */
  currentPath(): string;
};

export function createDiaryCommands({
  draft,
  setDraftField,
  navigate,
  saveEntry,
  currentPath,
}: DiaryActions) {
  const done = (message: string) => ({ ok: true as const, message });
  const fail = (message: string) => ({ ok: false as const, message });

  /** 一覧の「書く」を押して、書くページへ（もういれば何もしない） */
  const openWritePage = async (pointer: Pointer) => {
    if (currentPath() === "/new") return;
    await pointer.click(elementIds.writeEntry);
    navigate("/new");
  };

  return [
    defineCommand({
      type: "open_new_entry",
      description: "Open the page to write a new diary entry.",
      args: z.object({}),
      run: async (_, { pointer }) => {
        await openWritePage(pointer);
        return done("the writing page is open; fill it in with fill_entry");
      },
    }),
    defineCommand({
      type: "fill_entry",
      description:
        "Write the diary entry on the writing page (opens it if needed). Pass only the fields to change.",
      args: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
      }),
      run: async (input, { pointer }) => {
        await openWritePage(pointer);
        // 画面の上から順に打ち込む
        for (const field of ["title", "body"] as const) {
          const text = input[field];
          if (text === undefined) continue;
          await pointer.type(elementIds[field], text, (value) =>
            setDraftField(field, value),
          );
        }
        const next: Draft = {
          title: input.title ?? draft.title,
          body: input.body ?? draft.body,
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
      run: async (_, { pointer }) => {
        if (currentPath() !== "/new") {
          return fail("the writing page is not open; use fill_entry first");
        }
        await pointer.click(elementIds.saveEntry);
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
  return useMemo(
    () =>
      createDiaryCommands({
        draft,
        setDraftField,
        navigate,
        saveEntry,
        currentPath,
      }),
    [draft, setDraftField, navigate, saveEntry],
  );
}
