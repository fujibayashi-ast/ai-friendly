import { useMemo } from "react";
import { useSettings } from "../settings/settings-context";
import { createTranslate } from "./messages";

export function useI18n() {
  const { settings, setLanguage } = useSettings();
  const { language } = settings;
  const t = useMemo(() => createTranslate(language), [language]);
  return { language, setLanguage, t };
}
