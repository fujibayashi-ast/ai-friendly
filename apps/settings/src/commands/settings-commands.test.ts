import { describe, expect, mock, test } from "bun:test";
import { type ConfirmHandler, createAiTools } from "@ai-friendly/command";
import { createTranslate } from "../i18n/messages";
import type { Language, Theme } from "../settings/settings";
import { defaultSettings } from "../settings/settings";
import { createSettingsCommands } from "./settings-commands";

const setup = (confirm?: ConfirmHandler) => {
  const setTheme = mock((_: Theme) => {});
  const setLanguage = mock((_: Language) => {});
  const tools = createAiTools({
    commands: createSettingsCommands({
      setTheme,
      setLanguage,
      t: createTranslate("en"),
    }),
    confirm,
  });
  const run = (name: string, input: unknown) =>
    tools.find((t) => t.name === name)?.execute(input);
  return { setTheme, setLanguage, run };
};

describe("settings commands", () => {
  test("call the site's setters", async () => {
    const { setTheme, setLanguage, run } = setup();
    expect(await run("set_language", { language: "en" })).toEqual({ ok: true });
    expect(await run("set_theme", { theme: "dark" })).toEqual({ ok: true });
    expect(setLanguage).toHaveBeenCalledWith("en");
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  test("reset the settings only after confirmation", async () => {
    const confirm = mock<ConfirmHandler>(async () => true);
    const approved = setup(confirm);
    expect(await approved.run("reset_settings", {})).toEqual({ ok: true });
    expect(confirm).toHaveBeenCalledWith(
      { type: "reset_settings" },
      {
        title: "Reset your settings?",
        description: "The theme and language will go back to the defaults.",
        confirmLabel: "Reset",
      },
    );
    expect(approved.setTheme).toHaveBeenCalledWith(defaultSettings.theme);
    expect(approved.setLanguage).toHaveBeenCalledWith(defaultSettings.language);

    const declined = setup(async () => false);
    expect(await declined.run("reset_settings", {})).toMatchObject({
      ok: false,
      code: "rejected",
    });
    expect(declined.setTheme).not.toHaveBeenCalled();
  });
});
