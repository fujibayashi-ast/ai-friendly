export type Task = { id: string; title: string; done: boolean };

export const filters = ["all", "active", "done"] as const;
export type Filter = (typeof filters)[number];

export type TasksState = {
  tasks: readonly Task[];
  filter: Filter;
  /** 次に足すタスクの ID（短い連番） */
  nextId: number;
};

export const initialTasksState: TasksState = {
  tasks: [
    { id: "1", title: "牛乳を買う", done: true },
    { id: "2", title: "部屋を掃除する", done: false },
    { id: "3", title: "メールを返す", done: false },
  ],
  filter: "all",
  nextId: 4,
};

export function addTask(state: TasksState, title: string): TasksState {
  const trimmed = title.trim();
  if (!trimmed) return state;
  return {
    ...state,
    tasks: [
      ...state.tasks,
      { id: String(state.nextId), title: trimmed, done: false },
    ],
    nextId: state.nextId + 1,
  };
}

export function setTaskDone(
  state: TasksState,
  id: string,
  done: boolean,
): TasksState {
  return {
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, done } : task,
    ),
  };
}

export function deleteTask(state: TasksState, id: string): TasksState {
  return { ...state, tasks: state.tasks.filter((task) => task.id !== id) };
}

export function clearCompleted(state: TasksState): TasksState {
  return { ...state, tasks: state.tasks.filter((task) => !task.done) };
}

export function setFilter(state: TasksState, filter: Filter): TasksState {
  return { ...state, filter };
}

export function visibleTasks({
  tasks,
  filter,
}: Pick<TasksState, "tasks" | "filter">): readonly Task[] {
  if (filter === "all") return tasks;
  return tasks.filter((task) => task.done === (filter === "done"));
}
