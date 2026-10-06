import { Button } from "@ai-friendly/ui";
import { useI18n } from "../../i18n/use-i18n";
import { useTasks } from "../../tasks/tasks-context";
import { AddTaskForm } from "./add-task-form";
import { TaskFilter } from "./task-filter";
import { TaskList } from "./task-list";

export function HomePage() {
  const { t } = useI18n();
  const { tasks, clearCompleted } = useTasks();
  const remaining = tasks.filter((task) => !task.done).length;
  const hasCompleted = tasks.some((task) => task.done);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
      <div className="mt-8 flex flex-col gap-6">
        <AddTaskForm />
        <TaskFilter />
        <TaskList />
        <div className="flex items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground">
          <span aria-live="polite">{t("remaining", { count: remaining })}</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasCompleted}
            onClick={clearCompleted}
          >
            {t("clearCompleted")}
          </Button>
        </div>
      </div>
    </main>
  );
}
