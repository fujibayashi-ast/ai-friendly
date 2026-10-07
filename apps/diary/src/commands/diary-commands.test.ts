import { describe, expect, mock, test } from "bun:test";
import { createAiTools } from "@ai-friendly/command";
import type { Target } from "../ai/cursor/pointer";
import { type Draft, emptyDraft } from "../diary/diary";
import type { SaveResult } from "../diary/diary-context";
import { createTranslate } from "../i18n/messages";
import { createDiaryCommands } from "./diary-commands";

const setup = ({
  path = "/",
  draft = emptyDraft("2026-10-07"),
}: {
  path?: string;
  draft?: Draft;
} = {}) => {
  let current = path;
  // 押した先を順に記録し、打ち込みは一瞬で全部渡す
  const pointed: string[] = [];
  const name = (target: Target) =>
    "button" in target ? target.button : target.field;
  const actions = {
    setDraftField: mock((_: string, __: string) => {}),
    navigate: mock((to: string) => {
      current = to;
    }),
    saveEntry: mock((): SaveResult => ({ ok: true, id: 6 })),
  };
  const tools = createAiTools({
    commands: createDiaryCommands({
      draft,
      ...actions,
      currentPath: () => current,
      pointer: {
        click: async (target) => {
          pointed.push(name(target));
        },
        type: async (target, text, write) => {
          pointed.push(name(target));
          write(text);
        },
      },
      t: createTranslate("en"),
    }),
  });
  const run = (tool: string, input: unknown) =>
    tools.find((t) => t.name === tool)?.execute(input);
  return { ...actions, pointed, run };
};

describe("diary commands", () => {
  test("open the writing page with the Write button, then fill in from the top", async () => {
    const s = setup();
    expect(
      await s.run("fill_entry", {
        weather: "rainy",
        title: "Curry day",
        body: "It rained all day.",
      }),
    ).toEqual({
      ok: true,
      message:
        "fill_entry: filled in; not saved yet. every field is filled, so save it now unless the user wants changes",
    });
    expect(s.pointed).toEqual(["Write", "Rainy", "Title", "Entry"]);
    expect(s.navigate).toHaveBeenCalledWith("/new");
    expect(s.setDraftField.mock.calls).toEqual([
      ["weather", "rainy"],
      ["title", "Curry day"],
      ["body", "It rained all day."],
    ]);
  });

  test("tell what is still missing", async () => {
    const s = setup({ path: "/new" });
    expect(await s.run("fill_entry", { title: "Walk" })).toMatchObject({
      message:
        "fill_entry: filled in; not saved yet. still missing: weather, body",
    });
    expect(s.navigate).not.toHaveBeenCalled();
  });

  test("save with the Save button, and refuse outside the writing page", async () => {
    const s = setup({ path: "/new" });
    expect(await s.run("save_entry", {})).toEqual({
      ok: true,
      message: "save_entry: saved; the list now shows the entry at the top",
    });
    expect(s.pointed).toEqual(["Save"]);

    const list = setup();
    expect(await list.run("save_entry", {})).toMatchObject({
      message: "save_entry: the writing page is not open; use fill_entry first",
    });
    expect(list.saveEntry).not.toHaveBeenCalled();
  });

  test("tell why it was not saved", async () => {
    const s = setup({ path: "/new" });
    s.saveEntry.mockImplementation(() => ({
      ok: false,
      missing: ["body"],
    }));
    expect(await s.run("save_entry", {})).toMatchObject({
      message: "save_entry: not saved; missing: body",
    });
  });
});
