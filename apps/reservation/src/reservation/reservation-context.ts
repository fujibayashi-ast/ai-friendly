import { createContext, useContext } from "react";
import type { FormResult, ReservationValues } from "./reservation-form";

export type CompletedReservation = {
  number: string;
  values: ReservationValues;
};

/** カレンダーの週を送ったときの結果。今週より前には戻らない */
export type WeekResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "past" };

export type ReservationContextValue = {
  /** 開いたときの今日（YYYY-MM-DD） */
  today: string;
  /** カレンダーに出している週の月曜 */
  weekOf: string;
  /** 今の入力（画面の入力欄と同じ） */
  values: ReservationValues;
  /** 送信中。この間はフォームを変えない */
  submitting: boolean;
  /** 直前に受け付けた予約。フォームを変えると消える */
  completed: CompletedReservation | null;
  /** 入力欄に入れる（変わった項目だけ渡す）。日付を変えたらカレンダーもその週にする */
  fill(patch: Partial<ReservationValues>): void;
  /** その日を含む週をカレンダーに出す */
  showWeek(date: string): WeekResult;
  /** 「予約する」。エラーがあれば空の欄もエラーにして止め、エラーを返す。受け付けたら予約番号を返す */
  submit(): Promise<FormResult>;
};

export const ReservationContext = createContext<ReservationContextValue | null>(
  null,
);

export function useReservation(): ReservationContextValue {
  const value = useContext(ReservationContext);
  if (!value) throw new Error("ReservationProvider がありません");
  return value;
}
