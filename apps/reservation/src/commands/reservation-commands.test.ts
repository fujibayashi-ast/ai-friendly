import { describe, expect, mock, test } from "bun:test";
import { type ConfirmHandler, createAiTools } from "@ai-friendly/command";
import { createTranslate } from "../i18n/messages";
import { weekError } from "../reservation/dates";
import {
  emptyValues,
  type FormResult,
  formErrors,
  type ReservationValues,
} from "../reservation/reservation-form";
import { createReservationCommands } from "./reservation-commands";

// 2026-10-06 は火曜
const today = "2026-10-06";
const filled: ReservationValues = {
  ...emptyValues,
  date: "2026-10-09",
  time: "18:00",
  partySize: "2",
  seat: "table",
};

const setup = ({
  values = emptyValues,
  submitting = false,
  confirm,
}: {
  values?: ReservationValues;
  submitting?: boolean;
  confirm?: ConfirmHandler;
} = {}) => {
  // サイトの submit と同じ結果を返す
  const check = (form: ReservationValues): FormResult => {
    if (submitting) return { ok: false, reason: "submitting" };
    const errors = formErrors(form, today);
    return errors.length > 0
      ? { ok: false, reason: "invalid", errors }
      : { ok: true, number: "1001" };
  };
  const actions = {
    fill: mock((_: Partial<ReservationValues>) => {}),
    showWeek: mock((date: string) => {
      const reason = weekError(date, today);
      return reason ? { ok: false as const, reason } : { ok: true as const };
    }),
    submit: mock(async () => check(values)),
  };
  const confirmMock = mock(confirm ?? (async () => true));
  const tools = createAiTools({
    commands: createReservationCommands({
      today,
      values,
      submitting,
      ...actions,
      language: "en",
      t: createTranslate("en"),
    }),
    confirm: confirmMock,
  });
  const run = (name: string, input: unknown) =>
    tools.find((t) => t.name === name)?.execute(input);
  return { ...actions, confirm: confirmMock, run };
};

describe("reservation commands", () => {
  test("fill in only the given fields", async () => {
    const s = setup();
    expect(
      await s.run("fill_reservation_form", {
        date: "2026-10-07",
        party_size: 2,
      }),
    ).toEqual({
      ok: true,
      message:
        "fill_reservation_form: filled in; not sent yet. still missing: time, seat (ask the user for them one at a time)",
    });
    expect(s.fill).toHaveBeenCalledWith({
      date: "2026-10-07",
      time: undefined,
      partySize: "2",
      seat: undefined,
      couponCode: undefined,
    });
  });

  test("tell that the form is not sent yet when every field is filled", async () => {
    const s = setup({ values: filled });
    expect(
      await s.run("fill_reservation_form", { party_size: 3 }),
    ).toMatchObject({
      ok: true,
      message:
        "fill_reservation_form: filled in; not sent yet. all fields are filled; ask the user whether to book it",
    });
  });

  test("keep the input but tell what is wrong", async () => {
    const s = setup();
    expect(
      await s.run("fill_reservation_form", {
        date: "2026-10-13",
        coupon_code: "ｔｏｍａｒｉ１０",
      }),
    ).toEqual({
      ok: false,
      code: "domain_error",
      message:
        'fill_reservation_form: the form was filled in, but date: 2026-10-13 is a Tuesday; the restaurant is closed on Tuesdays; coupon_code: use half-width uppercase letters and digits (got "ｔｏｍａｒｉ１０")',
    });
    expect(s.fill).toHaveBeenCalledTimes(1);
  });

  test("tell the open times for a full time", async () => {
    const s = setup();
    expect(
      await s.run("fill_reservation_form", {
        date: "2026-10-09",
        time: "19:00",
      }),
    ).toMatchObject({
      message:
        "fill_reservation_form: the form was filled in, but time: 19:00 on 2026-10-09 is fully booked (available: 17:00, 17:30, 18:00, 18:30, 20:00, 20:30, 21:00)",
    });
  });

  test("move the calendar from this week on", async () => {
    const s = setup();
    expect(await s.run("show_availability", { week_of: "2026-10-14" })).toEqual(
      {
        ok: true,
      },
    );
    expect(s.showWeek).toHaveBeenCalledWith("2026-10-14");
    expect(
      await s.run("show_availability", { week_of: "2026-09-30" }),
    ).toMatchObject({
      message:
        "show_availability: week_of: 2026-09-30 is before this week (today: 2026-10-06)",
    });
  });

  test("send after confirming the reservation", async () => {
    const s = setup({ values: filled });
    expect(await s.run("submit_reservation", {})).toEqual({
      ok: true,
      message:
        "submit_reservation: reservation 1001 was made for 2026-10-09 18:00, 2 people, table",
    });
    expect(s.confirm.mock.calls[0]?.[1]).toMatchObject({
      description: "Fri, October 9 at 18:00, party of 2, Table.",
    });
    expect(s.submit).toHaveBeenCalledTimes(1);
  });

  test("tell the missing fields without asking", async () => {
    const s = setup();
    expect(await s.run("submit_reservation", {})).toEqual({
      ok: false,
      code: "domain_error",
      message:
        "submit_reservation: date is required; time is required; party_size is required; seat is required",
    });
    expect(s.confirm).not.toHaveBeenCalled();
  });

  test("refuse while sending", async () => {
    const s = setup({ values: filled, submitting: true });
    const message = "a reservation is being sent; try again after it finishes";
    expect(
      await s.run("fill_reservation_form", { party_size: 3 }),
    ).toMatchObject({ message: `fill_reservation_form: ${message}` });
    expect(await s.run("submit_reservation", {})).toMatchObject({
      message: `submit_reservation: ${message}`,
    });
    expect(s.confirm).not.toHaveBeenCalled();
  });
});
