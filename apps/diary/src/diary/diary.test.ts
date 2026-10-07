import { describe, expect, test } from "bun:test";
import { emptyDraft, isWeather, missingFields, sortEntries } from "./diary";
import { initialEntries } from "./entries";

describe("diary", () => {
  test("newest first", () => {
    expect(sortEntries(initialEntries).map((entry) => entry.id)).toEqual([
      5, 4, 3, 2, 1,
    ]);
  });

  test("tell the empty fields before saving", () => {
    expect(missingFields(emptyDraft("2026-10-07"))).toEqual([
      "weather",
      "title",
      "body",
    ]);
    expect(
      missingFields({
        date: "2026-10-07",
        weather: "rainy",
        title: "  ",
        body: "カレーを作った",
      }),
    ).toEqual(["title"]);
  });

  test("know the weathers", () => {
    expect(isWeather("rainy")).toBe(true);
    expect(isWeather("stormy")).toBe(false);
  });
});
