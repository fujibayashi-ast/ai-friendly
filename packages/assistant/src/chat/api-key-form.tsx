import { Button, Input } from "@ai-friendly/ui";
import { type ChangeEvent, type FormEvent, useId, useState } from "react";
import { type ChatLanguage, createTranslate } from "../i18n/messages";

/** Claude の API キーを入れるフォーム。`Chat` の `setup` に置く */
export function ApiKeyForm({
  language,
  onSubmit,
}: {
  language: ChatLanguage;
  onSubmit: (apiKey: string) => void;
}) {
  const t = createTranslate(language);
  const [value, setValue] = useState("");
  const inputId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <form className="flex flex-col gap-3 p-4" onSubmit={handleSubmit}>
      <p className="text-sm">{t("apiKey.description")}</p>
      <label htmlFor={inputId} className="text-sm font-medium">
        {t("apiKey.label")}
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          type="password"
          autoComplete="off"
          value={value}
          onChange={handleValueChange}
          placeholder="sk-ant-…"
        />
        <Button type="submit" disabled={!value.trim()}>
          {t("apiKey.save")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t("apiKey.note")}</p>
    </form>
  );
}
