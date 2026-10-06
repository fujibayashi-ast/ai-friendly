import { useI18n } from "../../i18n/use-i18n";
import { useTasks } from "../../tasks/tasks-context";
import { TaskItem } from "./task-item";

export function TaskList() {
  const { t } = useI18n();
  const { tasks } = useTasks();

  if (tasks.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
