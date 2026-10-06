import { ToggleGroup, ToggleGroupItem } from "@ai-friendly/ui";
import { languageNames } from "../i18n/language-names";
import { languages } from "../i18n/messages";
import { useI18n } from "../i18n/use-i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  const handleValueChange = (value: string) => {
    const next = languages.find((v) => v === value);
    if (next) setLanguage(next);
  };

  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      aria-label={t("language.label")}
      value={language}
      onValueChange={handleValueChange}
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
