export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "やることリスト",
  heading: "やること",
  "language.label": "言語",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "To-do list",
  heading: "To-do",
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
