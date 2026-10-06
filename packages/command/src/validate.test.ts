import { describe, expect, test } from "bun:test";
import { createTodoCommands } from "./__fixtures__/todo-commands";
import { validateArgs } from "./validate";

const { commands } = createTodoCommands();
const byType = (type: string) => {
  const definition = commands.find((d) => d.type === type);
  if (!definition) throw new Error(`no command ${type}`);
  return definition;
};

const messageOf = (type: string, input: unknown) => {
  const result = validateArgs(input, byType(type));
  return result.ok ? undefined : result.message;
};

describe("validateArgs", () => {
  test("accepts valid arguments", () => {
    expect(
      validateArgs({ id: "1", title: "a", tags: ["x"] }, byType("add_todo")),
    ).toEqual({ ok: true, args: { id: "1", title: "a", tags: ["x"] } });
    expect(
      validateArgs(
        { id: "1", level: "high", order: 2, meta: { note: "n" } },
        byType("set_priority"),
      ).ok,
    ).toBe(true);
  });

  test("rejects a non-object input", () => {
    expect(messageOf("add_todo", "1")).toBe("input: expected an object");
    expect(messageOf("add_todo", [])).toBe("input: expected an object");
  });

  test("lists fields for an unknown field", () => {
    expect(messageOf("add_todo", { id: "1", title: "a", name: "x" })).toBe(
      'input: unknown field "name" in add_todo (fields: id, title, tags)',
    );
  });

  test("treats inherited property names as unknown fields", () => {
    expect(
      messageOf("add_todo", JSON.parse('{"id":"1","title":"a","toString":1}')),
    ).toBe(
      'input: unknown field "toString" in add_todo (fields: id, title, tags)',
    );
  });

  test("reports a missing required field", () => {
    expect(messageOf("add_todo", { id: "1" })).toBe(
      'input: missing required field "title" in add_todo',
    );
    expect(messageOf("add_todo", undefined)).toBe(
      'input: missing required field "id" in add_todo',
    );
  });

  test("reports type mismatches with the path", () => {
    expect(messageOf("add_todo", { id: "1", title: 3 })).toBe(
      "input.title: Invalid input: expected string, received number",
    );
    expect(
      messageOf("add_todo", { id: "1", title: "a", tags: ["x", null] }),
    ).toBe("input.tags[1]: Invalid input: expected string, received null");
    expect(
      messageOf("set_priority", { id: "1", level: "high", order: 1.5 }),
    ).toBe("input.order: Invalid input: expected int, received number");
    expect(
      messageOf("set_priority", { id: "1", level: "high", meta: {} }),
    ).toBe('input.meta: missing required field "note" in object');
  });

  test("reports enum mismatches", () => {
    expect(messageOf("set_priority", { id: "1", level: "mid" })).toBe(
      'input.level: Invalid option: expected one of "low"|"high"',
    );
  });
});
