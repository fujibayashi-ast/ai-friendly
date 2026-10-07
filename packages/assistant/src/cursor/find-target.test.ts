import { afterEach, describe, expect, test } from "bun:test";
import { findClickable, findField } from "./find-target";

type FakeElement = {
  textContent: string;
  htmlFor?: string;
  getAttribute(name: string): string | null;
};

const element = (
  textContent: string,
  { label, htmlFor }: { label?: string; htmlFor?: string } = {},
): FakeElement => ({
  textContent,
  htmlFor,
  getAttribute: (name) => (name === "aria-label" ? (label ?? null) : null),
});

// bun test には DOM がないので、探すのに使うところだけを差し替える
const original = globalThis.document;
const useDocument = (
  clickables: FakeElement[],
  labels: FakeElement[],
  byId: Record<string, FakeElement>,
) => {
  globalThis.document = {
    querySelectorAll: (selector: string) =>
      selector === "label" ? labels : clickables,
    getElementById: (id: string) => byId[id] ?? null,
  } as unknown as Document;
};
afterEach(() => {
  globalThis.document = original;
});

describe("find target", () => {
  test("find a button by its text or aria-label", () => {
    const write = element(" 書く ");
    const close = element("×", { label: "閉じる" });
    useDocument([write, close], [], {});
    expect(findClickable("書く")).toBe(write as unknown as HTMLElement);
    expect(findClickable("閉じる")).toBe(close as unknown as HTMLElement);
    expect(findClickable("保存")).toBeNull();
  });

  test("find a field by the text of its label", () => {
    const input = element("");
    useDocument([], [element("タイトル", { htmlFor: "title" })], {
      title: input,
    });
    expect(findField("タイトル")).toBe(input as unknown as HTMLElement);
    expect(findField("本文")).toBeNull();
  });
});
