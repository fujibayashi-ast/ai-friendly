import { describe, expect, test } from "bun:test";
import { clickOn, typeDelay, typeInto } from "./cursor";

describe("cursor", () => {
  test("type 45ms per character, and keep long text within 4 seconds", () => {
    expect(typeDelay(10)).toBe(45);
    expect(typeDelay(200)).toBe(20);
    expect(typeDelay(0)).toBe(45);
  });

  test("without a target, write the whole text at once and do not move", async () => {
    const written: string[] = [];
    await typeInto(null, "雨の日", (value) => written.push(value));
    expect(written).toEqual(["雨の日"]);
    await clickOn(null);
  });
});
