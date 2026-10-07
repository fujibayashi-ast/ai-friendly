import { expect, test } from "bun:test";
import { z } from "zod";
import { defineCommand } from "../define-command";
import { confirmationMark } from "./confirmation-mark";

const command = (requiresConfirmation?: boolean | (() => boolean)) =>
  defineCommand({
    type: "reset",
    description: "Reset",
    args: z.object({}),
    requiresConfirmation,
    run() {},
  });

test("marks whether the command asks the user to confirm", () => {
  expect(confirmationMark(command(true))).toBe(" [asks the user to confirm]");
  expect(confirmationMark(command(() => true))).toBe(
    " [may ask the user to confirm]",
  );
  expect(confirmationMark(command(false))).toBe("");
  expect(confirmationMark(command())).toBe("");
});
