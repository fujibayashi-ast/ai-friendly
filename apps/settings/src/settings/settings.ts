export const themes = ["light", "dark"] as const;
export const languages = ["ja", "en"] as const;

export type Theme = (typeof themes)[number];
export type Language = (typeof languages)[number];
export type Settings = { theme: Theme; language: Language };

export const defaultSettings: Settings = {
  theme: "light",
  language: "ja",
};
