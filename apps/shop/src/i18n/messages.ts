export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "くらしの店",
  heading: "商品一覧",
  "language.label": "言語",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "Daily Goods",
  heading: "Products",
  "language.label": "Language",
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

export type Translate = (key: MessageKey) => string;

export function createTranslate(language: Language): Translate {
  return (key) => messages[language][key];
}
