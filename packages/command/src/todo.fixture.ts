import { defineCommand } from "./define-command";

export type Todo = { id: string; title: string; done: boolean; tags: string[] };
export type TodoState = { todos: Todo[] };

export const addTodo = defineCommand({
  type: "add_todo",
  description: "Add a todo",
  args: {
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
    },
    required: ["id", "title"],
  },
  apply(state: TodoState, args) {
    if (state.todos.some((t) => t.id === args.id)) {
      return { ok: false, message: `todo "${args.id}" already exists` };
    }
    const todo = {
      id: args.id,
      title: args.title,
      done: false,
      tags: args.tags ?? [],
    };
    return { ok: true, state: { todos: [...state.todos, todo] } };
  },
});

export const deleteTodo = defineCommand({
  type: "delete_todo",
  description: "Delete a todo",
  args: {
    type: "object",
    properties: { id: { type: "string" } },
    required: ["id"],
  },
  requiresConfirmation: true,
  apply(state: TodoState, args) {
    if (!state.todos.some((t) => t.id === args.id)) {
      return { ok: false, message: `todo "${args.id}" not found` };
    }
    return {
      ok: true,
      state: { todos: state.todos.filter((t) => t.id !== args.id) },
    };
  },
});

export const setPriority = defineCommand({
  type: "set_priority",
  description: "Set priority",
  args: {
    type: "object",
    properties: {
      id: { type: "string" },
      level: { type: "string", enum: ["low", "high"] },
      order: { type: "integer" },
      meta: {
        type: "object",
        properties: { note: { type: "string" } },
        required: ["note"],
      },
    },
    required: ["id", "level"],
  },
  apply(state: TodoState) {
    return { ok: true, state };
  },
});

export const todoCommands = [addTodo, deleteTodo, setPriority] as const;
