import { describe, expect, test } from "bun:test";
import { todoCommands } from "./__fixtures__/todo-commands";
import type { CommandDefinition } from "./types";
import { validateCommands } from "./validate";

const definitions = new Map<string, CommandDefinition<unknown>>(
  todoCommands.map((d) => [d.type, d as CommandDefinition<unknown>]),
);

const messageOf = (input: unknown) => {
  const result = validateCommands(input, definitions);
  return result.ok ? undefined : result.message;
};

describe("validateCommands", () => {
  test("accepts a single command and an array", () => {
    expect(
      validateCommands({ type: "add_todo", id: "1", title: "a" }, definitions)
        .ok,
    ).toBe(true);
    expect(
      validateCommands(
        [
          { type: "add_todo", id: "1", title: "a", tags: ["x"] },
          {
            type: "set_priority",
            id: "1",
            level: "high",
            order: 2,
            meta: { note: "n" },
          },
        ],
        definitions,
      ).ok,
    ).toBe(true);
  });

  test("rejects an empty batch", () => {
    expect(messageOf([])).toBe("commands: expected at least 1 command");
  });

  test("rejects a value without type", () => {
    expect(messageOf([{ id: "1" }])).toBe(
      'commands[0]: expected an object with a string "type"',
    );
  });

  test("lists available commands for an unknown type", () => {
    expect(
      messageOf([
        { type: "add_todo", id: "1", title: "a" },
        { type: "add_itme" },
      ]),
    ).toBe(
      'commands[1]: unknown command "add_itme" (available: add_todo, delete_todo, complete_todo, set_priority)',
    );
  });

  test("lists fields for an unknown field", () => {
    expect(
      messageOf({ type: "add_todo", id: "1", title: "a", name: "x" }),
    ).toBe(
      'commands[0]: unknown field "name" in add_todo (fields: id, title, tags)',
    );
  });

  test("treats inherited property names as unknown fields", () => {
    expect(
      messageOf(
        JSON.parse('{"type":"add_todo","id":"1","title":"a","toString":1}'),
      ),
    ).toBe(
      'commands[0]: unknown field "toString" in add_todo (fields: id, title, tags)',
    );
  });

  test("reports a missing required field", () => {
    expect(messageOf({ type: "add_todo", id: "1" })).toBe(
      'commands[0]: missing required field "title" in add_todo',
    );
  });

  test("reports type mismatches with the path", () => {
    expect(messageOf({ type: "add_todo", id: "1", title: 3 })).toBe(
      "commands[0].title: Invalid input: expected string, received number",
    );
    expect(
      messageOf({ type: "add_todo", id: "1", title: "a", tags: ["x", null] }),
    ).toBe(
      "commands[0].tags[1]: Invalid input: expected string, received null",
    );
    expect(
      messageOf({ type: "set_priority", id: "1", level: "high", order: 1.5 }),
    ).toBe("commands[0].order: Invalid input: expected int, received number");
    expect(
      messageOf({ type: "set_priority", id: "1", level: "high", meta: {} }),
    ).toBe('commands[0].meta: missing required field "note" in object');
  });

  test("reports enum mismatches", () => {
    expect(messageOf({ type: "set_priority", id: "1", level: "mid" })).toBe(
      'commands[0].level: Invalid option: expected one of "low"|"high"',
    );
  });
});
