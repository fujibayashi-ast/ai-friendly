export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "ひびのにっき",
  "language.label": "言語",
  "entries.title": "にっき",
  "entries.write": "書く",
  "entries.empty": "まだ日記がありません。",
  "newEntry.title": "にっきを書く",
  "newEntry.back": "一覧へ",
  "newEntry.date": "日付",
  "newEntry.weather": "天気",
  "newEntry.title.label": "タイトル",
  "newEntry.body": "本文",
  "newEntry.save": "保存",
  "newEntry.required": "{field}を入れてください。",
  "newEntry.weatherRequired": "天気を選んでください。",
  "weather.sunny": "晴れ",
  "weather.cloudy": "くもり",
  "weather.rainy": "雨",
  "weather.snowy": "雪",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "Daily Notes",
  "language.label": "Language",
  "entries.title": "Diary",
  "entries.write": "Write",
  "entries.empty": "No entries yet.",
  "newEntry.title": "Write an entry",
  "newEntry.back": "Back to the list",
  "newEntry.date": "Date",
  "newEntry.weather": "Weather",
  "newEntry.title.label": "Title",
  "newEntry.body": "Entry",
  "newEntry.save": "Save",
  "newEntry.required": "Enter the {field}.",
  "newEntry.weatherRequired": "Choose the weather.",
  "weather.sunny": "Sunny",
  "weather.cloudy": "Cloudy",
  "weather.rainy": "Rainy",
  "weather.snowy": "Snowy",
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
