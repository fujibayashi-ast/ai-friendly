import { Button, Input } from "@ai-friendly/ui";
import { useId, useState } from "react";
import { useI18n } from "../../i18n/use-i18n";
import { useTasks } from "../../tasks/tasks-context";

export function AddTaskForm() {
  const { t } = useI18n();
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const inputId = useId();

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        addTask(title);
        setTitle("");
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {t("add.label")}
      </label>
      <Input
        id={inputId}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={t("add.placeholder")}
        autoComplete="off"
      />
      <Button type="submit" disabled={!title.trim()}>
        {t("add.submit")}
      </Button>
    </form>
  );
}
