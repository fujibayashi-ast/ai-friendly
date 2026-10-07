import { useMemo } from "react";
import { useI18nContext } from "./i18n-context";
import { createTranslate } from "./messages";

export function useI18n() {
  const { language, setLanguage } = useI18nContext();
  const t = useMemo(() => createTranslate(language), [language]);
  return { language, setLanguage, t };
}
