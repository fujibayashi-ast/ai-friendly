import { defineCommand } from "@ai-friendly/command";
import { useMemo } from "react";
import { z } from "zod";
import { formatDate } from "../i18n/format";
import { isMessageKey, type Language, type Translate } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";
import { availableTimes } from "../reservation/availability";
import { isDate, weekStart } from "../reservation/dates";
import {
  type ReservationContextValue,
  useReservation,
} from "../reservation/reservation-context";
import {
  applyPatch,
  type FormError,
  type FormResult,
  formErrors,
  type ReservationValues,
  seats,
} from "../reservation/reservation-form";

type ReservationActions = Pick<
  ReservationContextValue,
  "today" | "values" | "submitting" | "fill" | "showWeek" | "submit"
> & { language: Language; t: Translate };

/** 入力のエラーを、AI が読んで直せる英文にする */
export function describeError(
  error: FormError,
  values: ReservationValues,
  today: string,
): string {
  const { date, time, partySize, couponCode } = values;
  switch (`${error.field}.${error.code}`) {
    case "date.required":
      return "date is required";
    case "date.invalid":
      return `date: "${date}" is not a date (use YYYY-MM-DD)`;
    case "date.past":
      return `date: ${date} is in the past (today: ${today})`;
    case "date.closed":
      return `date: ${date} is a Tuesday; the restaurant is closed on Tuesdays`;
    case "date.full":
      return `date: ${date} is fully booked`;
    case "time.required":
      return "time is required";
    case "time.invalid":
      return `time: "${time}" is not a reservation time (17:00 to 21:00, every 30 minutes)`;
    case "time.full":
      return `time: ${time} on ${date} is fully booked (available: ${availableTimes(date).join(", ")})`;
    case "partySize.required":
      return "party_size is required";
    case "partySize.range":
      return `party_size: ${partySize} is not between 1 and 8`;
    case "seat.required":
      return "seat is required";
    case "seat.counter":
      return `seat: counter seats are for up to 2 people (party_size: ${partySize})`;
    case "seat.private":
      return `seat: private rooms are for 4 or more people (party_size: ${partySize})`;
    case "couponCode.format":
      return `coupon_code: use half-width uppercase letters and digits (got "${couponCode}")`;
    case "couponCode.unknown":
      return `coupon_code: "${couponCode}" is not a valid coupon`;
    default:
      return `${error.field}: ${error.code}`;
  }
}

export function createReservationCommands({
  today,
  values,
  submitting,
  fill,
  showWeek,
  submit,
  language,
  t,
}: ReservationActions) {
  const fail = (message: string) => ({ ok: false as const, message });
  // 画面と同じく、送信中はフォームを受け付けない
  const sending = () =>
    fail("a reservation is being sent; try again after it finishes");
  const describe = (errors: FormError[], form: ReservationValues) =>
    errors.map((error) => describeError(error, form, today)).join("; ");
  /** サイトの関数（submit）の結果を、AI が読んで直せる英文にする */
  const toRunResult = (result: FormResult) => {
    if (result.ok) return;
    if (result.reason === "submitting") return sending();
    return fail(describe(result.errors, values));
  };
  const seatLabel = (seat: string) => {
    const key = `seat.${seat}`;
    return isMessageKey(key) ? t(key) : seat;
  };

  return [
    defineCommand({
      type: "fill_reservation_form",
      description:
        "Fill in the reservation form, including a coupon code the user gives. Pass only the fields you know (date: YYYY-MM-DD, time: HH:MM, seat: table, counter or private).",
      args: z.object({
        date: z.string().optional(),
        time: z.string().optional(),
        party_size: z.number().int().optional(),
        seat: z.enum(seats).optional(),
        coupon_code: z.string().optional(),
      }),
      run: ({ date, time, party_size, seat, coupon_code }) => {
        // 入力欄の名前と値（文字列）に合わせる。渡さなかった項目（undefined）は変えない
        const patch = {
          date,
          time,
          partySize: party_size?.toString(),
          seat,
          couponCode: coupon_code,
        };
        if (submitting) return sending();
        fill(patch);
        // React Hook Form の検証は次の描画で反映されるので、入れた値で同じルールを確かめる
        // 人が入力したときと同じく、入れた値は残してエラーを伝える
        const form = applyPatch(values, patch);
        const errors = formErrors(form, today, { required: false });
        if (errors.length > 0) {
          return fail(`the form was filled in, but ${describe(errors, form)}`);
        }
      },
    }),
    defineCommand({
      type: "show_availability",
      description:
        "Show the week that includes this date in the availability calendar (week_of: YYYY-MM-DD).",
      args: z.object({ week_of: z.string() }),
      run: ({ week_of }) => {
        if (!isDate(week_of)) {
          return fail(`week_of: "${week_of}" is not a date (use YYYY-MM-DD)`);
        }
        if (weekStart(week_of) < weekStart(today)) {
          return fail(
            `week_of: ${week_of} is before this week (today: ${today})`,
          );
        }
        showWeek(week_of);
      },
    }),
    defineCommand({
      type: "submit_reservation",
      description: "Send the reservation in the form.",
      args: z.object({}),
      // エラーがあれば確認せずに知らせる（確認は run の前に決めるので、同じルールで先に確かめる）
      requiresConfirmation: () =>
        !submitting && formErrors(values, today).length === 0,
      confirmation: () => ({
        title: t("submit.title"),
        description: t("submit.description", {
          date: isDate(values.date) ? formatDate(language, values.date) : "",
          time: values.time,
          count: values.partySize,
          seat: seatLabel(values.seat),
        }),
        confirmLabel: t("submit.confirm"),
      }),
      // 画面の「予約する」と同じ処理。エラーがあれば画面にも出る
      run: async () => toRunResult(await submit()),
    }),
  ];
}

/** 予約フォームの Command。サイトの useReservation の関数を呼ぶ */
export function useReservationCommands() {
  const { today, values, submitting, fill, showWeek, submit } =
    useReservation();
  const { language, t } = useI18n();
  return useMemo(
    () =>
      createReservationCommands({
        today,
        values,
        submitting,
        fill,
        showWeek,
        submit,
        language,
        t,
      }),
    [today, values, submitting, fill, showWeek, submit, language, t],
  );
}
