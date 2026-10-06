import { useI18n } from "../../i18n/use-i18n";
import { AddTaskForm } from "./add-task-form";
import { TaskList } from "./task-list";

export function HomePage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
      <div className="mt-8 flex flex-col gap-6">
        <AddTaskForm />
        <TaskList />
      </div>
    </main>
  );
}
