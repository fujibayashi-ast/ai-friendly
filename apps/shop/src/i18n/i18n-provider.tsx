import { type ReactNode, useEffect, useMemo, useState } from "react";
import { I18nContext } from "./i18n-context";
import { createTranslate, type Language } from "./messages";

/** 表示の言語を持ち、`<html lang>` と `<title>` に反映する */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ja");

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = createTranslate(language)("siteName");
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <I18nContext value={value}>{children}</I18nContext>;
}
