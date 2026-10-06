import { Button } from "@ai-friendly/ui";
import { Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useI18n } from "../../i18n/use-i18n";
import type { Task } from "../../tasks/tasks";
import { useTasks } from "../../tasks/tasks-context";

export function TaskItem({ task }: { task: Task }) {
  const { t } = useI18n();
  const { setTaskDone, deleteTask } = useTasks();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTaskDone(task.id, event.target.checked);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <li className="flex items-center gap-3 py-2.5">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={task.done}
          onChange={handleChange}
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
        onClick={handleDelete}
        className="shrink-0 text-muted-foreground"
      >
        <Trash2 aria-hidden />
      </Button>
    </li>
  );
}
