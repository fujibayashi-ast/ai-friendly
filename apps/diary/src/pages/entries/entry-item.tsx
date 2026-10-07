import type { Entry } from "../../diary/diary";
import { formatDate } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { WeatherIcon } from "../weather-icon";

export function EntryItem({ entry }: { entry: Entry }) {
  const { language, t } = useI18n();
  return (
    <li className="flex flex-col gap-1 py-4">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="tabular-nums">{formatDate(language, entry.date)}</span>
        <WeatherIcon weather={entry.weather} />
        <span className="sr-only">{t(`weather.${entry.weather}`)}</span>
      </p>
      <h2 className="font-semibold">{entry.title}</h2>
      <p className="line-clamp-2 text-sm leading-relaxed">{entry.body}</p>
    </li>
  );
}
