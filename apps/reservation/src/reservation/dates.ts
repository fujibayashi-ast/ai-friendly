// 日付は "YYYY-MM-DD" の文字列で扱い、計算は dayjs で行う
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const format = "YYYY-MM-DD";

export const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
export type Weekday = (typeof weekdays)[number];

/** 端末の今日 */
export function localToday(): string {
  return dayjs().format(format);
}

/** "YYYY-MM-DD" の形で、実在する日付か */
export function isDate(value: string): boolean {
  return dayjs(value, format, true).isValid();
}

export function addDays(date: string, days: number): string {
  return dayjs(date).add(days, "day").format(format);
}

export function weekdayOf(date: string): Weekday {
  return weekdays[dayjs(date).day()] ?? "sunday";
}

/** その日を含む週の月曜 */
export function weekStart(date: string): string {
  const day = dayjs(date);
  return day.subtract((day.day() + 6) % 7, "day").format(format);
}

/** カレンダーに出せない週の理由。今週より前には戻らない */
export function weekError(
  date: string,
  today: string,
): "invalid" | "past" | undefined {
  if (!isDate(date)) return "invalid";
  if (weekStart(date) < weekStart(today)) return "past";
}

export function weekDates(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
