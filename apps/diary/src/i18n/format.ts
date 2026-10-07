import type { Language } from "./messages";

const locales: Record<Language, string> = { ja: "ja-JP", en: "en-US" };

/** YYYY-MM-DD を「10月7日(水)」「Wed, October 7」にする */
export function formatDate(language: Language, date: string): string {
  return new Intl.DateTimeFormat(locales[language], {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(date));
}
