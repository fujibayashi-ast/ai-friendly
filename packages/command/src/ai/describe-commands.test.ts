import { expect, test } from "bun:test";
import { z } from "zod";
import { todoCommands } from "../__fixtures__/todo-commands";
import { defineCommand } from "../define-command";
import { describeCommands } from "./describe-commands";

test("describes each command in one line", () => {
  expect(describeCommands(todoCommands).split("\n")).toEqual([
    "add_todo(id: string, title: string, tags?: string[]) — Add a todo",
    "delete_todo(id: string) — Delete a todo [may ask the user to confirm]",
    "complete_todo(id: string) — Mark a todo as done",
    'set_priority(id: string, level: "low"|"high", order?: integer, meta?: { note: string }) — Set priority',
  ]);
});

test("marks static confirmation, defaults, nullable and no-arg commands", () => {
  const command = defineCommand({
    type: "reset",
    description: "Reset",
    args: z.object({
      mode: z.enum(["soft", "hard"]).default("soft"),
      note: z.string().nullable(),
      ids: z.array(z.union([z.string(), z.number()])).optional(),
    }),
    apply(state: null) {
      return { ok: true, state };
    },
    requiresConfirmation: true,
  });
  const noArgs = defineCommand({
    type: "clear",
    description: "Clear",
    args: z.object({}),
    apply(state: null) {
      return { ok: true, state };
    },
  });

  expect(describeCommands([command, noArgs]).split("\n")).toEqual([
    'reset(mode?: "soft"|"hard", note: string|null, ids?: (string|number)[]) — Reset [asks the user to confirm]',
    "clear() — Clear",
  ]);
});
