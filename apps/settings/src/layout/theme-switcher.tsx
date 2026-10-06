import { ToggleGroup, ToggleGroupItem } from "@ai-friendly/ui";
import { Monitor, Moon, Sun } from "lucide-react";
import { useI18n } from "../i18n/use-i18n";
import { themes } from "../settings/settings";
import { useTheme } from "../settings/use-theme";

const icons = { light: Sun, dark: Moon, system: Monitor } as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      aria-label={t("theme.label")}
      value={theme}
      onValueChange={(value) => {
        const next = themes.find((v) => v === value);
        if (next) setTheme(next);
      }}
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
