import { describe, expect, test } from "bun:test";
import type { Pointer } from "@ai-friendly/command";
import { hideWhenIdle } from "./hide-when-idle";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const base: Pointer = {
  click: () => sleep(10),
  type: async (_id, text, write) => write(text),
};

describe("hideWhenIdle", () => {
  test("hide after the pointer stays idle", async () => {
    let hidden = 0;
    const pointer = hideWhenIdle(base, () => hidden++, 30);
    await pointer.click("a");
    expect(hidden).toBe(0);
    await sleep(50);
    expect(hidden).toBe(1);
  });

  test("do not hide while the next action follows soon", async () => {
    let hidden = 0;
    const pointer = hideWhenIdle(base, () => hidden++, 30);
    const written: string[] = [];
    await pointer.click("a");
    await sleep(15);
    await pointer.type("b", "雨", (value) => written.push(value));
    await sleep(15);
    expect(hidden).toBe(0);
    expect(written).toEqual(["雨"]);
    await sleep(30);
    expect(hidden).toBe(1);
  });
});
