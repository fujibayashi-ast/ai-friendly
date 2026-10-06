import { z } from "zod";
import { availableTimes, isClosed, times } from "./availability";
import { isDate } from "./dates";

export const seats = ["table", "counter", "private"] as const;
export type Seat = (typeof seats)[number];

export const partySizes = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** ダミーのクーポン（ドリンク 1 杯サービス） */
export const couponCodes = ["TOMARI10", "WELCOME"] as const;

/** 入力欄の値。どれも文字列で持つ（選んでいなければ ""） */
export type ReservationValues = {
  date: string;
  time: string;
  partySize: string;
  seat: string;
  couponCode: string;
};

export type ReservationField = keyof ReservationValues;

export const reservationFields = [
  "date",
  "time",
  "partySize",
  "seat",
  "couponCode",
] as const satisfies readonly ReservationField[];

export const emptyValues: ReservationValues = {
  date: "",
  time: "",
  partySize: "",
  seat: "",
  couponCode: "",
};

/** 今の値に、渡した項目（undefined は変えない）を重ねる */
export function applyPatch(
  values: ReservationValues,
  patch: Partial<ReservationValues>,
): ReservationValues {
  const next = { ...values };
  for (const field of reservationFields) {
    const value = patch[field];
    if (value !== undefined) next[field] = value;
  }
  return next;
}

/**
 * 入力のルール。エラーの `message` はエラーの種類（`closed` など）で、画面と AI がそれぞれの文言にする
 * 今日によってルールが変わるので、今日を受け取って作る
 */
export function reservationSchema(today: string) {
  return z
    .object({
      date: z.string(),
      time: z.string(),
      partySize: z.string(),
      seat: z.string(),
      couponCode: z.string(),
    })
    .superRefine((values, ctx) => {
      const add = (path: ReservationField, message: string) =>
        ctx.addIssue({ code: "custom", path: [path], message });
      const { date, time, partySize, seat, couponCode } = values;
      const size = Number(partySize);

      if (!date) add("date", "required");
      else if (!isDate(date)) add("date", "invalid");
      else if (date < today) add("date", "past");
      else if (isClosed(date)) add("date", "closed");
      else if (availableTimes(date).length === 0) add("date", "full");

      if (!time) add("time", "required");
      else if (!times.some((item) => item === time)) add("time", "invalid");
      else if (
        isDate(date) &&
        availableTimes(date).length > 0 &&
        !availableTimes(date).includes(time)
      ) {
        add("time", "full");
      }

      if (!partySize) add("partySize", "required");
      else if (!partySizes.some((item) => item === size)) {
        add("partySize", "range");
      }

      if (!seat) add("seat", "required");
      else if (!seats.some((item) => item === seat)) add("seat", "invalid");
      else if (seat === "counter" && size > 2) add("seat", "counter");
      else if (seat === "private" && partySize && size < 4) {
        add("seat", "private");
      }

      if (couponCode && !/^[A-Z0-9]+$/.test(couponCode)) {
        add("couponCode", "format");
      } else if (
        couponCode &&
        !couponCodes.some((item) => item === couponCode)
      ) {
        add("couponCode", "unknown");
      }
    });
}

export type FormError = { field: ReservationField; code: string };

/** 送ったときの結果。受け付けたら予約番号を返す */
export type FormResult =
  | { ok: true; number: string }
  | { ok: false; reason: "submitting" }
  | { ok: false; reason: "invalid"; errors: FormError[] };

/** 入力のエラーの一覧。`required: false` なら空の欄のエラーは除く */
export function formErrors(
  values: ReservationValues,
  today: string,
  { required = true } = {},
): FormError[] {
  const result = reservationSchema(today).safeParse(values);
  if (result.success) return [];
  return result.error.issues.flatMap((issue) => {
    const field = reservationFields.find((item) => item === issue.path[0]);
    if (!field || (!required && issue.message === "required")) return [];
    return [{ field, code: issue.message }];
  });
}
