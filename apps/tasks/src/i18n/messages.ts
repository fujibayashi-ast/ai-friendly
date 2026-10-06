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
  "delete.title": "やることを削除しますか？",
  "delete.description": "「{title}」を削除します。",
  "delete.confirm": "削除する",
  "clear.title": "完了したものを削除しますか？",
  "clear.description": "完了した {count} 件を削除します。",
  "clear.confirm": "削除する",
  "confirm.cancel": "やめる",
  "chat.suggest.add": "洗濯する、を追加して",
  "chat.suggest.done": "部屋の掃除を完了にして",
  "chat.suggest.clear": "完了したものを消して",
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
  "delete.title": "Delete this to-do?",
  "delete.description": '"{title}" will be deleted.',
  "delete.confirm": "Delete",
  "clear.title": "Clear completed to-dos?",
  "clear.description": "{count} completed to-dos will be deleted.",
  "clear.confirm": "Delete",
  "confirm.cancel": "Cancel",
  "chat.suggest.add": "Add do the laundry",
  "chat.suggest.done": "Mark cleaning the room as done",
  "chat.suggest.clear": "Clear the completed ones",
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
