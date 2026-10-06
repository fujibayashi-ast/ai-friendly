import type { Language } from "./messages";

const locales: Record<Language, string> = { ja: "ja-JP", en: "en-US" };

export function formatPrice(language: Language, price: number): string {
  return new Intl.NumberFormat(locales[language], {
    style: "currency",
    currency: "JPY",
  }).format(price);
}

/** YYYY-MM-DD を「11月20日」「November 20」にする */
export function formatDate(language: Language, date: string): string {
  return new Intl.DateTimeFormat(locales[language], {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
