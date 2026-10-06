import { availableTimes, isClosed, times } from "./availability";
import { isDate, weekStart } from "./dates";

export const seats = ["table", "counter", "private"] as const;
export type Seat = (typeof seats)[number];

export const partySizes = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** ダミーのクーポン（ドリンク 1 杯サービス） */
export const couponCodes = ["TOMARI10", "WELCOME"] as const;

export type ReservationForm = {
  date: string;
  time: string;
  partySize: number | null;
  seat: Seat | null;
  couponCode: string;
};

export type FormField = keyof ReservationForm;

export type FormError =
  | { field: "date"; code: "required" | "invalid" | "past" | "closed" | "full" }
  | { field: "time"; code: "required" | "invalid" | "full" }
  | { field: "partySize"; code: "required" | "range" }
  | { field: "seat"; code: "required" | "counter" | "private" }
  | { field: "couponCode"; code: "format" | "unknown" };

export type ReservationState = {
  form: ReservationForm;
  /** カレンダーに出している週の月曜 */
  weekOf: string;
  /** 送信中。この間はフォームを変えない */
  submitting: boolean;
  /** 「予約する」を押した後は、空の欄もエラーにする */
  showRequired: boolean;
};

export const emptyForm: ReservationForm = {
  date: "",
  time: "",
  partySize: null,
  seat: null,
  couponCode: "",
};

export function initialReservationState(today: string): ReservationState {
  return {
    form: emptyForm,
    weekOf: weekStart(today),
    submitting: false,
    showRequired: false,
  };
}

/** 入力のルール。空の欄は `showRequired` のときだけエラーにする */
export function validate(
  form: ReservationForm,
  today: string,
  showRequired = true,
): FormError[] {
  const errors: FormError[] = [];
  const { date, time, partySize, seat, couponCode } = form;

  if (!date) {
    if (showRequired) errors.push({ field: "date", code: "required" });
  } else if (!isDate(date)) {
    errors.push({ field: "date", code: "invalid" });
  } else if (date < today) {
    errors.push({ field: "date", code: "past" });
  } else if (isClosed(date)) {
    errors.push({ field: "date", code: "closed" });
  } else if (availableTimes(date).length === 0) {
    errors.push({ field: "date", code: "full" });
  }

  if (!time) {
    if (showRequired) errors.push({ field: "time", code: "required" });
  } else if (!times.some((item) => item === time)) {
    errors.push({ field: "time", code: "invalid" });
  } else if (
    isDate(date) &&
    !isClosed(date) &&
    availableTimes(date).length > 0 &&
    !availableTimes(date).includes(time)
  ) {
    errors.push({ field: "time", code: "full" });
  }

  if (partySize === null) {
    if (showRequired) errors.push({ field: "partySize", code: "required" });
  } else if (!partySizes.some((size) => size === partySize)) {
    errors.push({ field: "partySize", code: "range" });
  }

  if (seat === null) {
    if (showRequired) errors.push({ field: "seat", code: "required" });
  } else if (seat === "counter" && partySize !== null && partySize > 2) {
    errors.push({ field: "seat", code: "counter" });
  } else if (seat === "private" && partySize !== null && partySize < 4) {
    errors.push({ field: "seat", code: "private" });
  }

  if (couponCode) {
    if (!/^[A-Z0-9]+$/.test(couponCode)) {
      errors.push({ field: "couponCode", code: "format" });
    } else if (!couponCodes.some((code) => code === couponCode)) {
      errors.push({ field: "couponCode", code: "unknown" });
    }
  }
  return errors;
}

/** 変わった項目だけ渡す。日付を変えたら、カレンダーもその週にする */
export function updateForm(
  state: ReservationState,
  patch: Partial<ReservationForm>,
): ReservationState {
  if (state.submitting) return state;
  const form = { ...state.form, ...patch };
  const weekOf =
    patch.date && isDate(patch.date) ? weekStart(patch.date) : state.weekOf;
  return { ...state, form, weekOf };
}

export function showWeek(
  state: ReservationState,
  date: string,
): ReservationState {
  return isDate(date) ? { ...state, weekOf: weekStart(date) } : state;
}

export function showRequiredErrors(state: ReservationState): ReservationState {
  return { ...state, showRequired: true };
}

export function startSubmit(state: ReservationState): ReservationState {
  return { ...state, submitting: true };
}

export function completeSubmit(state: ReservationState): ReservationState {
  return { ...state, form: emptyForm, submitting: false, showRequired: false };
}
