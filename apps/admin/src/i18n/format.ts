import type { Language } from "./messages";

const locales: Record<Language, string> = { ja: "ja-JP", en: "en-US" };

export function formatPrice(language: Language, price: number): string {
  return new Intl.NumberFormat(locales[language], {
    style: "currency",
    currency: "JPY",
  }).format(price);
}

/** YYYY-MM-DD を「2026/10/07」「Oct 7, 2026」にする */
export function formatDate(language: Language, date: string): string {
  return new Intl.DateTimeFormat(locales[language], {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
}
