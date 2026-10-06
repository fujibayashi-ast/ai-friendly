import { expect, test } from "bun:test";
import { messages } from "./messages";

test("every language has the same keys", () => {
  expect(Object.keys(messages.en).sort()).toEqual(
    Object.keys(messages.ja).sort(),
  );
});
