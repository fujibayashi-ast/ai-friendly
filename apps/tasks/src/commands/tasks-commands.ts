import { defineCommand } from "@ai-friendly/command";
import { useMemo } from "react";
import { z } from "zod";
import type { Translate } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";
import type { Task } from "../tasks/tasks";
import { type TasksContextValue, useTasks } from "../tasks/tasks-context";

type TasksActions = Pick<
  TasksContextValue,
  "tasks" | "addTask" | "setTaskDone" | "deleteTask"
> & { t: Translate };

export function createTasksCommands({
  tasks,
  addTask,
  setTaskDone,
  deleteTask,
  t,
}: TasksActions) {
  const notFound = (id: string) => ({
    ok: false as const,
    message: `task "${id}" not found (ids: ${tasks.map((task) => task.id).join(", ") || "none"})`,
  });
  const find = (id: string): Task | undefined =>
    tasks.find((task) => task.id === id);
  const completed = tasks.filter((task) => task.done);

  return [
    defineCommand({
      type: "add_task",
      description: "Add a to-do with the title.",
      args: z.object({ title: z.string().trim().min(1) }),
      run: ({ title }) => addTask(title),
    }),
    defineCommand({
      type: "set_task_done",
      description: "Mark a to-do as done or not done.",
      args: z.object({ id: z.string(), done: z.boolean() }),
      run: ({ id, done }) => {
        if (!find(id)) return notFound(id);
        setTaskDone(id, done);
      },
    }),
    defineCommand({
      type: "delete_task",
      description: "Delete a to-do.",
      args: z.object({ id: z.string() }),
      requiresConfirmation: true,
      confirmation: ({ id }) => ({
        title: t("delete.title"),
        description: t("delete.description", { title: find(id)?.title ?? "" }),
        confirmLabel: t("delete.confirm"),
      }),
      run: ({ id }) => {
        if (!find(id)) return notFound(id);
        deleteTask(id);
      },
    }),
    defineCommand({
      type: "clear_completed",
      description: "Delete all the completed to-dos.",
      args: z.object({}),
      // 消すものがないときは確認せずに知らせる
      requiresConfirmation: () => completed.length > 0,
      confirmation: () => ({
        title: t("clear.title"),
        description: t("clear.description", { count: completed.length }),
        confirmLabel: t("clear.confirm"),
      }),
      // サイトにない機能を、サイトの関数の組み合わせで足す
      run: () => {
        if (completed.length === 0) {
          return { ok: false, message: "there are no completed tasks" };
        }
        for (const task of completed) deleteTask(task.id);
      },
    }),
  ];
}

/** やることの Command。サイトの useTasks の関数を呼ぶ */
export function useTasksCommands() {
  const { tasks, addTask, setTaskDone, deleteTask } = useTasks();
  const { t } = useI18n();
  return useMemo(
    () => createTasksCommands({ tasks, addTask, setTaskDone, deleteTask, t }),
    [tasks, addTask, setTaskDone, deleteTask, t],
  );
}
