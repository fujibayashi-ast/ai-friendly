import { Button, Input } from "@ai-friendly/ui";
import { type ChangeEvent, type FormEvent, useId, useState } from "react";
import { useI18n } from "../../i18n/use-i18n";
import { useTasks } from "../../tasks/tasks-context";

export function AddTaskForm() {
  const { t } = useI18n();
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const inputId = useId();

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTask(title);
    setTitle("");
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="sr-only">
        {t("add.label")}
      </label>
      <Input
        id={inputId}
        value={title}
        onChange={handleTitleChange}
        placeholder={t("add.placeholder")}
        autoComplete="off"
      />
      <Button type="submit" disabled={!title.trim()}>
        {t("add.submit")}
      </Button>
    </form>
  );
}
