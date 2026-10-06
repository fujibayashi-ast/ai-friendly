import { type Weekday, weekdayOf } from "./dates";

/** 予約できる時刻（17:00〜21:00 の 30 分ごと） */
export const times = [
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
] as const;

export const closedWeekday: Weekday = "tuesday";

/** 残りがこの数以下なら「残りわずか」 */
export const fewLimit = 4;

export type DayStatus = "closed" | "full" | "few" | "available";

// ダミーの空き状況。曜日と日付で決める
const fullByWeekday: Partial<Record<Weekday, readonly string[]>> = {
  friday: ["19:00", "19:30"],
  saturday: ["18:00", "18:30", "19:00", "19:30", "20:00"],
};

/** 毎月 15 日は貸し切り */
function isPrivateEvent(date: string): boolean {
  return date.endsWith("-15");
}

export function isClosed(date: string): boolean {
  return weekdayOf(date) === closedWeekday;
}

export function availableTimes(date: string): string[] {
  if (isClosed(date) || isPrivateEvent(date)) return [];
  const full = fullByWeekday[weekdayOf(date)] ?? [];
  return times.filter((time) => !full.includes(time));
}

export function dayStatus(date: string): DayStatus {
  if (isClosed(date)) return "closed";
  const count = availableTimes(date).length;
  if (count === 0) return "full";
  return count <= fewLimit ? "few" : "available";
}
