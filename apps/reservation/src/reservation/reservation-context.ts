import { createContext, useContext } from "react";
import type { ReservationForm, ReservationState } from "./reservation";

export type CompletedReservation = { number: string; form: ReservationForm };

export type ReservationContextValue = {
  state: ReservationState;
  /** 開いたときの今日（YYYY-MM-DD） */
  today: string;
  /** 直前に受け付けた予約。フォームを変えると消える */
  completed: CompletedReservation | null;
  updateForm(patch: Partial<ReservationForm>): void;
  showWeek(date: string): void;
  /** エラーがあれば空の欄もエラーにして止める。なければ送る */
  submit(): Promise<void>;
};

export const ReservationContext = createContext<ReservationContextValue | null>(
  null,
);

export function useReservation(): ReservationContextValue {
  const value = useContext(ReservationContext);
  if (!value) throw new Error("ReservationProvider がありません");
  return value;
}
