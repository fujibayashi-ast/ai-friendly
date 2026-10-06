import { describe, expect, test } from "bun:test";
import { availableTimes, dayStatus } from "./availability";
import { addDays, isDate, weekdayOf, weekStart } from "./dates";
import {
  emptyValues,
  formErrors,
  type ReservationValues,
} from "./reservation-form";

// 2026-10-06 は火曜（定休日）
const today = "2026-10-06";
const values = (patch: Partial<ReservationValues>): ReservationValues => ({
  ...emptyValues,
  date: "2026-10-07",
  time: "19:00",
  partySize: "2",
  seat: "table",
  ...patch,
});
const codes = (patch: Partial<ReservationValues>) =>
  formErrors(values(patch), today).map(
    (error) => `${error.field}.${error.code}`,
  );

describe("dates", () => {
  test("weekday, week start and real dates", () => {
    expect(weekdayOf(today)).toBe("tuesday");
    expect(weekStart(today)).toBe("2026-10-05");
    expect(weekStart("2026-10-11")).toBe("2026-10-05");
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(isDate("2026-02-30")).toBe(false);
    expect(isDate("2026/10/07")).toBe(false);
  });
});

describe("availability", () => {
  test("closed on Tuesdays, busy on weekends, private event on the 15th", () => {
    expect(dayStatus("2026-10-06")).toBe("closed");
    expect(dayStatus("2026-10-07")).toBe("available");
    expect(availableTimes("2026-10-09")).not.toContain("19:00");
    expect(dayStatus("2026-10-10")).toBe("few");
    expect(dayStatus("2026-10-15")).toBe("full");
  });
});

describe("rules", () => {
  test("accept a valid form", () => {
    expect(codes({})).toEqual([]);
  });

  test("report each rule", () => {
    expect(codes({ date: "2026-10-01" })).toEqual(["date.past"]);
    expect(codes({ date: "2026-10-13" })).toEqual(["date.closed"]);
    expect(codes({ date: "2026-10-15" })).toEqual(["date.full"]);
    expect(codes({ date: "2026-10-09" })).toEqual(["time.full"]);
    expect(codes({ time: "16:00" })).toEqual(["time.invalid"]);
    expect(codes({ partySize: "9" })).toEqual(["partySize.range"]);
    expect(codes({ partySize: "4", seat: "counter" })).toEqual([
      "seat.counter",
    ]);
    expect(codes({ seat: "private" })).toEqual(["seat.private"]);
    expect(codes({ couponCode: "ｔｏｍａｒｉ１０" })).toEqual([
      "couponCode.format",
    ]);
    expect(codes({ couponCode: "NOPE" })).toEqual(["couponCode.unknown"]);
    expect(codes({ couponCode: "TOMARI10" })).toEqual([]);
  });

  test("leave out empty fields when asked", () => {
    expect(formErrors(emptyValues, today, { required: false })).toEqual([]);
    expect(formErrors(emptyValues, today).map((error) => error.field)).toEqual([
      "date",
      "time",
      "partySize",
      "seat",
    ]);
  });
});
