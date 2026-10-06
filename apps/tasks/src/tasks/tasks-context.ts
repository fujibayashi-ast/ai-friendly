import { createContext, useContext } from "react";
import type { Filter, Task } from "./tasks";

export type TasksContextValue = {
  tasks: readonly Task[];
  filter: Filter;
  addTask(title: string): void;
  setTaskDone(id: string, done: boolean): void;
  deleteTask(id: string): void;
  clearCompleted(): void;
  setFilter(filter: Filter): void;
};

export const TasksContext = createContext<TasksContextValue | null>(null);

export function useTasks(): TasksContextValue {
  const value = useContext(TasksContext);
  if (!value) throw new Error("TasksProvider がありません");
  return value;
}
