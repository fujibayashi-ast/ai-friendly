import { Button } from "@ai-friendly/ui";
import { Trash2 } from "lucide-react";
import { useI18n } from "../../i18n/use-i18n";
import { visibleTasks } from "../../tasks/tasks";
import { useTasks } from "../../tasks/tasks-context";

export function TaskList() {
  const { t } = useI18n();
  const { tasks, filter, setTaskDone, deleteTask } = useTasks();
  const visible = visibleTasks({ tasks, filter });

  if (visible.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t(`empty.${filter}`)}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {visible.map((task) => (
        <li key={task.id} className="flex items-center gap-3 py-2.5">
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={task.done}
              onChange={(event) => setTaskDone(task.id, event.target.checked)}
              className="size-4 shrink-0 accent-primary"
            />
            <span
              className={
                task.done
                  ? "truncate text-muted-foreground line-through"
                  : "truncate"
              }
            >
              {task.title}
            </span>
          </label>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("task.delete", { title: task.title })}
            onClick={() => deleteTask(task.id)}
            className="shrink-0 text-muted-foreground"
          >
            <Trash2 aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
