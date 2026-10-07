import type { Language } from "./messages";

/** 言語名は、表示中の言語に関係なくその言語で書く（辞書には入れない） */
export const languageNames: Record<Language, { short: string; name: string }> =
  {
    ja: { short: "JA", name: "日本語" },
    en: { short: "EN", name: "English" },
  };
