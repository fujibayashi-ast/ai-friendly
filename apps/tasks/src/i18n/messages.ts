export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "やることリスト",
  heading: "やること",
  "language.label": "言語",
  "add.label": "やることを追加",
  "add.placeholder": "例: 牛乳を買う",
  "add.submit": "追加",
  "filter.label": "表示するもの",
  "filter.all": "すべて",
  "filter.active": "未完了",
  "filter.done": "完了",
  "empty.all": "やることはありません。",
  "empty.active": "未完了のものはありません。",
  "empty.done": "完了したものはありません。",
  "task.delete": "「{title}」を削除",
  remaining: "未完了 {count} 件",
  clearCompleted: "完了したものを削除",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "To-do list",
  heading: "To-do",
  "language.label": "Language",
  "add.label": "Add a to-do",
  "add.placeholder": "e.g. Buy milk",
  "add.submit": "Add",
  "filter.label": "Show",
  "filter.all": "All",
  "filter.active": "Active",
  "filter.done": "Completed",
  "empty.all": "Nothing to do.",
  "empty.active": "No active to-dos.",
  "empty.done": "No completed to-dos.",
  "task.delete": 'Delete "{title}"',
  remaining: "{count} active",
  clearCompleted: "Clear completed",
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
