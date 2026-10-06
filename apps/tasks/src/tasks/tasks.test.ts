import { describe, expect, test } from "bun:test";
import {
  addTask,
  deleteTask,
  initialTasksState,
  setTaskDone,
  type TasksState,
} from "./tasks";

const state: TasksState = {
  tasks: [
    { id: "1", title: "a", done: true },
    { id: "2", title: "b", done: false },
  ],
  nextId: 3,
};

describe("tasks", () => {
  test("adds a task with the next id and a trimmed title", () => {
    const next = addTask(state, "  c  ");
    expect(next.tasks.at(-1)).toEqual({ id: "3", title: "c", done: false });
    expect(next.nextId).toBe(4);
  });

  test("ignores an empty title", () => {
    expect(addTask(state, "   ")).toBe(state);
  });

  test("does not reuse the id of a deleted task", () => {
    const next = addTask(deleteTask(state, "2"), "c");
    expect(next.tasks.map((task) => task.id)).toEqual(["1", "3"]);
  });

  test("marks a task done or not done", () => {
    expect(setTaskDone(state, "2", true).tasks[1]?.done).toBe(true);
    expect(setTaskDone(state, "1", false).tasks[0]?.done).toBe(false);
  });

  test("starts with sample tasks", () => {
    expect(initialTasksState.tasks).toHaveLength(3);
    expect(initialTasksState.nextId).toBe(4);
  });
});
