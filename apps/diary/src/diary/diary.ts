export const weathers = ["sunny", "cloudy", "rainy", "snowy"] as const;
export type Weather = (typeof weathers)[number];

export type Entry = {
  id: number;
  /** YYYY-MM-DD */
  date: string;
  weather: Weather;
  title: string;
  body: string;
};

/** 書きかけ。選んでいない・書いていない項目は空文字 */
export type Draft = {
  date: string;
  weather: Weather | "";
  title: string;
  body: string;
};

export const draftFields = ["date", "weather", "title", "body"] as const;
export type DraftField = (typeof draftFields)[number];

export const emptyDraft = (today: string): Draft => ({
  date: today,
  weather: "",
  title: "",
  body: "",
});

/** 新しい順 */
export function sortEntries(entries: readonly Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
  );
}

/** 保存できない理由（空の項目）。画面と AI のどちらから保存しても同じ判定で断る */
export function missingFields(draft: Draft): DraftField[] {
  return draftFields.filter((field) => draft[field].trim() === "");
}

export function isWeather(value: string): value is Weather {
  return weathers.some((weather) => weather === value);
}
