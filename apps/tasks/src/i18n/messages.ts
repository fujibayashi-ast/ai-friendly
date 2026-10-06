export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "やることリスト",
  heading: "やること",
  "language.label": "言語",
  "add.label": "やることを追加",
  "add.placeholder": "例: 牛乳を買う",
  "add.submit": "追加",
  empty: "やることはありません。",
  "task.delete": "「{title}」を削除",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "To-do list",
  heading: "To-do",
  "language.label": "Language",
  "add.label": "Add a to-do",
  "add.placeholder": "e.g. Buy milk",
  "add.submit": "Add",
  empty: "Nothing to do.",
  "task.delete": 'Delete "{title}"',
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

/** `{name}` を `values` で置き換える */
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
