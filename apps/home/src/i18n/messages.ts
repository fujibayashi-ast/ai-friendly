export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "AI Friendly Site",
  samples: "サンプル",
  "language.label": "言語",
  "sample.settings.title": "表示の設定",
  "sample.settings.description":
    "テーマと言語を切り替えるだけの小さなサイト。リセットは確認してから行います。",
  "sample.settings.example": "ダークにして",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "AI Friendly Site",
  samples: "Samples",
  "language.label": "Language",
  "sample.settings.title": "Display settings",
  "sample.settings.description":
    "A small site that switches the theme and language. Resetting asks you first.",
  "sample.settings.example": "Switch to dark",
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

/** 言語名は、表示中の言語に関係なくその言語で書く */
export const languageNames: Record<Language, { short: string; name: string }> =
  {
    ja: { short: "JA", name: "日本語" },
    en: { short: "EN", name: "English" },
  };
