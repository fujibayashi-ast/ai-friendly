import dayjs from "dayjs";
import type { Language } from "./messages";

const locales: Record<Language, string> = { ja: "ja-JP", en: "en-US" };

/** "2026-10-09" を「10月9日(金)」「Fri, October 9」にする */
export function formatDate(language: Language, date: string): string {
  return new Intl.DateTimeFormat(locales[language], {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(dayjs(date).toDate());
}

/** カレンダーの曜日（「金」「Fri」） */
export function formatWeekday(language: Language, date: string): string {
  return new Intl.DateTimeFormat(locales[language], {
    weekday: "short",
  }).format(dayjs(date).toDate());
}
