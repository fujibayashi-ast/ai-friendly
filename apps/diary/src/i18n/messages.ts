export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "ひびのにっき",
  "language.label": "言語",
  "entries.title": "にっき",
  "newEntry.title": "にっきを書く",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "Daily Notes",
  "language.label": "Language",
  "entries.title": "Diary",
  "newEntry.title": "Write an entry",
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

export type Translate = (
  key: MessageKey,
  values?: Record<string, string | number>,
) => string;

export function createTranslate(language: Language): Translate {
  return (key, values = {}) =>
    messages[language][key].replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
}
