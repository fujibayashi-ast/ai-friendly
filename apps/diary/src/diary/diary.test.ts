import { describe, expect, test } from "bun:test";
import { emptyDraft, missingFields, sortEntries } from "./diary";
import { initialEntries } from "./entries";

describe("diary", () => {
  test("newest first", () => {
    expect(sortEntries(initialEntries).map((entry) => entry.id)).toEqual([
      5, 4, 3, 2, 1,
    ]);
  });

  test("tell the empty fields before saving", () => {
    expect(missingFields(emptyDraft())).toEqual(["title", "body"]);
    expect(missingFields({ title: "  ", body: "カレーを作った" })).toEqual([
      "title",
    ]);
  });
});
