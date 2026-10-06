import { z } from "zod";
import { defineCommand } from "../define-command";

export type Todo = { id: string; title: string; done: boolean; tags: string[] };

/** 配列を書き換える関数を呼ぶ Command（サイトの setter の代わり） */
export function createTodoCommands(todos: Todo[] = []) {
  const find = (id: string) => todos.find((t) => t.id === id);

  const addTodo = defineCommand({
    type: "add_todo",
    description: "Add a todo",
    args: z.object({
      id: z.string(),
      title: z.string(),
      tags: z.array(z.string()).optional(),
    }),
    run(args) {
      if (find(args.id)) {
        return { ok: false, message: `todo "${args.id}" already exists` };
      }
      todos.push({ ...args, done: false, tags: args.tags ?? [] });
    },
  });

  const deleteTodo = defineCommand({
    type: "delete_todo",
    description: "Delete a todo",
    args: z.object({ id: z.string() }),
    requiresConfirmation: (args) => !find(args.id)?.done,
    confirmation: (args) => ({
      title: "Delete the todo?",
      description: `"${find(args.id)?.title}" is not done yet.`,
      confirmLabel: "Delete",
    }),
    run(args) {
      const index = todos.findIndex((t) => t.id === args.id);
      if (index < 0)
        return { ok: false, message: `todo "${args.id}" not found` };
      todos.splice(index, 1);
    },
  });

  const completeTodo = defineCommand({
    type: "complete_todo",
    description: "Mark a todo as done",
    args: z.object({ id: z.string() }),
    async run(args) {
      const todo = find(args.id);
      if (todo) todo.done = true;
    },
  });

  const setPriority = defineCommand({
    type: "set_priority",
    description: "Set priority",
    args: z.object({
      id: z.string(),
      level: z.enum(["low", "high"]),
      order: z.int().optional(),
      meta: z.object({ note: z.string() }).optional(),
    }),
    run() {},
  });

  return {
    todos,
    commands: [addTodo, deleteTodo, completeTodo, setPriority] as const,
  };
}
