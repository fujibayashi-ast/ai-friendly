import { defineCommand } from "@ai-friendly/command";
import { z } from "zod";
import {
  defaultSettings,
  languages,
  type Settings,
  themes,
} from "../settings/settings";

export const setTheme = defineCommand({
  type: "set_theme",
  description: 'Change the color theme. "system" follows the OS setting.',
  args: z.object({ theme: z.enum(themes) }),
  apply(state: Settings, args) {
    return { ok: true, state: { ...state, theme: args.theme } };
  },
});

export const setLanguage = defineCommand({
  type: "set_language",
  description: "Change the display language.",
  args: z.object({ language: z.enum(languages) }),
  apply(state: Settings, args) {
    return { ok: true, state: { ...state, language: args.language } };
  },
});

export const resetSettings = defineCommand({
  type: "reset_settings",
  description: "Reset the theme and language to the defaults.",
  args: z.object({}),
  apply() {
    return { ok: true, state: defaultSettings };
  },
  requiresConfirmation: true,
});

export const settingsCommands = [setTheme, setLanguage, resetSettings] as const;
