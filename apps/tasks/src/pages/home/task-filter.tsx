import { ToggleGroup, ToggleGroupItem } from "@ai-friendly/ui";
import { useI18n } from "../../i18n/use-i18n";
import { filters } from "../../tasks/tasks";
import { useTasks } from "../../tasks/tasks-context";

export function TaskFilter() {
  const { t } = useI18n();
  const { filter, setFilter } = useTasks();
  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      aria-label={t("filter.label")}
      value={filter}
      onValueChange={(value) => {
        const next = filters.find((f) => f === value);
        if (next) setFilter(next);
      }}
    >
      {filters.map((item) => (
        <ToggleGroupItem key={item} value={item} className="px-3 text-xs">
          {t(`filter.${item}`)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
