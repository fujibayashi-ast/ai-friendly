import { defineCommand } from "@ai-friendly/command";
import { useMemo } from "react";
import { z } from "zod";
import type { Translate } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";
import {
  defaultSettings,
  type Language,
  languages,
  type Theme,
  themes,
} from "../settings/settings";
import { useTheme } from "../settings/use-theme";

type SettingsActions = {
  setTheme(theme: Theme): void;
  setLanguage(language: Language): void;
  t: Translate;
};

export function createSettingsCommands({
  setTheme,
  setLanguage,
  t,
}: SettingsActions) {
  return [
    defineCommand({
      type: "set_theme",
      description: "Change the color theme of this website (light or dark).",
      args: z.object({ theme: z.enum(themes) }),
      run: ({ theme }) => setTheme(theme),
    }),
    defineCommand({
      type: "set_language",
      description:
        "Change the language this website is shown in (ja: Japanese, en: English).",
      args: z.object({ language: z.enum(languages) }),
      run: ({ language }) => setLanguage(language),
    }),
    defineCommand({
      type: "reset_settings",
      description: "Reset the theme and language to the defaults.",
      args: z.object({}),
      requiresConfirmation: true,
      confirmation: () => ({
        title: t("reset.title"),
        description: t("reset.description"),
        confirmLabel: t("reset.confirm"),
      }),
      run() {
        setTheme(defaultSettings.theme);
        setLanguage(defaultSettings.language);
      },
    }),
  ];
}

/** 設定の Command。サイトの useTheme / useI18n の setter を呼ぶ */
export function useSettingsCommands() {
  const { setTheme } = useTheme();
  const { setLanguage, t } = useI18n();
  return useMemo(
    () => createSettingsCommands({ setTheme, setLanguage, t }),
    [setTheme, setLanguage, t],
  );
}
