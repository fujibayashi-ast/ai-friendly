import { describe, expect, test } from "bun:test";
import { isJsonEqual } from "./equal";

describe("isJsonEqual", () => {
  test("compares objects and arrays by content", () => {
    expect(isJsonEqual({ a: [1, { b: "x" }] }, { a: [1, { b: "x" }] })).toBe(
      true,
    );
    expect(isJsonEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  test("detects differences", () => {
    expect(isJsonEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isJsonEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(isJsonEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(isJsonEqual([], {})).toBe(false);
    expect(isJsonEqual(null, {})).toBe(false);
    expect(isJsonEqual("1", 1)).toBe(false);
  });
});
