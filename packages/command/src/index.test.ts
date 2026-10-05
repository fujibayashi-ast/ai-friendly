import { expect, test } from "bun:test";
import * as command from "./index";

test("package entry can be imported", () => {
  expect(command).toBeDefined();
});
