import { afterEach, describe, expect, test } from "bun:test";
import { findElement } from "./find-element";

// bun test には DOM がないので、探すのに使うところだけを差し替える
const original = globalThis.document;
const useDocument = (getElementById: (id: string) => unknown) => {
  globalThis.document = { getElementById } as unknown as Document;
};
afterEach(() => {
  globalThis.document = original;
});

describe("find element", () => {
  test("wait until the element appears after moving to another page", async () => {
    const element = {};
    let calls = 0;
    useDocument((id) => (id === "save-entry" && ++calls >= 3 ? element : null));
    expect(await findElement("save-entry")).toBe(element as HTMLElement);
    expect(calls).toBe(3);
  });

  test("give up when it does not appear", async () => {
    useDocument(() => null);
    const start = Date.now();
    expect(await findElement("missing")).toBeNull();
    expect(Date.now() - start).toBeGreaterThanOrEqual(1000);
  });
});
