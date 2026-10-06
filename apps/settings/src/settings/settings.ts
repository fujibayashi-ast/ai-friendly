import { z } from "zod";

export const themes = ["light", "dark"] as const;
export const languages = ["ja", "en"] as const;

export const settingsSchema = z.object({
  theme: z.enum(themes),
  language: z.enum(languages),
});

export type Settings = z.infer<typeof settingsSchema>;
export type Theme = Settings["theme"];
export type Language = Settings["language"];

export const defaultSettings: Settings = {
  theme: "light",
  language: "ja",
};
