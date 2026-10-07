import {
  Button,
  Input,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
} from "@ai-friendly/ui";
import { type ChangeEvent, type FormEvent, useId, useState } from "react";
import { Link } from "react-router";
import { type DraftField, weathers } from "../../diary/diary";
import { useDiary } from "../../diary/diary-context";
import { useSaveEntry } from "../../diary/use-save-entry";
import { useI18n } from "../../i18n/use-i18n";
import { WeatherIcon } from "../weather-icon";
import { Field } from "./field";

export function NewEntryPage() {
  const { t } = useI18n();
  const { today, draft, setDraftField } = useDiary();
  const saveEntry = useSaveEntry();
  const id = useId();
  // 「保存」で断られた項目。直したら消す
  const [missing, setMissing] = useState<DraftField[]>([]);

  const change = (field: DraftField, value: string) => {
    setDraftField(field, value);
    setMissing((current) => current.filter((item) => item !== field));
  };
  const errorOf = (field: DraftField, label: string) => {
    if (!missing.includes(field)) return "";
    return field === "weather"
      ? t("newEntry.weatherRequired")
      : t("newEntry.required", { field: label });
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    change("date", event.target.value);
  };
  const handleWeatherChange = (value: string) => {
    if (value) change("weather", value);
  };
  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    change("title", event.target.value);
  };
  const handleBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    change("body", event.target.value);
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = saveEntry();
    if (!result.ok) setMissing(result.missing);
  };

  const labels = {
    date: t("newEntry.date"),
    weather: t("newEntry.weather"),
    title: t("newEntry.title.label"),
    body: t("newEntry.body"),
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="text-sm underline underline-offset-4">
        {t("newEntry.back")}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">
        {t("newEntry.title")}
      </h1>
      <form noValidate className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Field
          id={`${id}-date`}
          label={labels.date}
          error={errorOf("date", labels.date)}
        >
          <Input
            id={`${id}-date`}
            type="date"
            max={today}
            value={draft.date}
            onChange={handleDateChange}
            className="w-44"
          />
        </Field>
        <Field
          id={`${id}-weather`}
          label={labels.weather}
          error={errorOf("weather", labels.weather)}
        >
          <ToggleGroup
            id={`${id}-weather`}
            type="single"
            variant="outline"
            aria-label={labels.weather}
            value={draft.weather}
            onValueChange={handleWeatherChange}
          >
            {weathers.map((weather) => (
              <ToggleGroupItem key={weather} value={weather}>
                <WeatherIcon weather={weather} />
                {t(`weather.${weather}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field
          id={`${id}-title`}
          label={labels.title}
          error={errorOf("title", labels.title)}
        >
          <Input
            id={`${id}-title`}
            value={draft.title}
            onChange={handleTitleChange}
            aria-invalid={missing.includes("title")}
            aria-describedby={
              missing.includes("title") ? `${id}-title-error` : undefined
            }
          />
        </Field>
        <Field
          id={`${id}-body`}
          label={labels.body}
          error={errorOf("body", labels.body)}
        >
          <Textarea
            id={`${id}-body`}
            rows={8}
            value={draft.body}
            onChange={handleBodyChange}
            aria-invalid={missing.includes("body")}
            aria-describedby={
              missing.includes("body") ? `${id}-body-error` : undefined
            }
            className="min-h-48 leading-relaxed"
          />
        </Field>
        <div>
          <Button type="submit">{t("newEntry.save")}</Button>
        </div>
      </form>
    </div>
  );
}
