import { ToggleGroup, ToggleGroupItem } from "@ai-friendly/ui";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "../i18n/use-i18n";
import { themes } from "../settings/settings";
import { useTheme } from "../settings/use-theme";

const icons = { light: Sun, dark: Moon } as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const handleValueChange = (value: string) => {
    const next = themes.find((v) => v === value);
    if (next) setTheme(next);
  };

  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      aria-label={t("theme.label")}
      value={theme}
      onValueChange={handleValueChange}
    >
      {themes.map((item) => {
        const Icon = icons[item];
        return (
          <ToggleGroupItem
            key={item}
            value={item}
            aria-label={t(`theme.${item}`)}
            title={t(`theme.${item}`)}
          >
            <Icon aria-hidden />
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
