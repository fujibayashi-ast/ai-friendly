import { type ReactNode, useMemo, useState } from "react";
import {
  addTask,
  clearCompleted,
  deleteTask,
  type Filter,
  initialTasksState,
  setFilter,
  setTaskDone,
} from "./tasks";
import { TasksContext } from "./tasks-context";

/** タスクと絞り込みを持つ。保存はしない（再読み込みで最初に戻る） */
export function TasksProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialTasksState);

  const actions = useMemo(
    () => ({
      addTask: (title: string) => setState((s) => addTask(s, title)),
      setTaskDone: (id: string, done: boolean) =>
        setState((s) => setTaskDone(s, id, done)),
      deleteTask: (id: string) => setState((s) => deleteTask(s, id)),
      clearCompleted: () => setState((s) => clearCompleted(s)),
      setFilter: (filter: Filter) => setState((s) => setFilter(s, filter)),
    }),
    [],
  );

  const value = useMemo(
    () => ({ tasks: state.tasks, filter: state.filter, ...actions }),
    [state, actions],
  );
  return <TasksContext value={value}>{children}</TasksContext>;
}
