import { createContext, useContext } from "react";
import type { Task } from "./tasks";

export type TasksContextValue = {
  tasks: readonly Task[];
  addTask(title: string): void;
  setTaskDone(id: string, done: boolean): void;
  deleteTask(id: string): void;
};

export const TasksContext = createContext<TasksContextValue | null>(null);

export function useTasks(): TasksContextValue {
  const value = useContext(TasksContext);
  if (!value) throw new Error("TasksProvider がありません");
  return value;
}
