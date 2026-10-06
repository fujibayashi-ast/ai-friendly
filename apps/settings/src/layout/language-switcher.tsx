import { ToggleGroup, ToggleGroupItem } from "@ai-friendly/ui";
import { languageNames } from "../i18n/language-names";
import { useI18n } from "../i18n/use-i18n";
import { languages } from "../settings/settings";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      aria-label={t("language.label")}
      value={language}
      onValueChange={(value) => {
        const next = languages.find((v) => v === value);
        if (next) setLanguage(next);
      }}
    >
      {languages.map((item) => (
        <ToggleGroupItem
          key={item}
          value={item}
          lang={item}
          aria-label={languageNames[item].name}
          className="px-2.5 text-xs"
        >
          {languageNames[item].short}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
