import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createTranslate } from "../i18n/messages";
import { applyTheme } from "./apply-theme";
import { defaultSettings, type Language, type Theme } from "./settings";
import { SettingsContext } from "./settings-context";

/** 表示の設定（テーマ・言語）を持ち、`<html>` に反映する */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);

  const setTheme = useCallback(
    (theme: Theme) => setSettings((s) => ({ ...s, theme })),
    [],
  );
  const setLanguage = useCallback(
    (language: Language) => setSettings((s) => ({ ...s, language })),
    [],
  );

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);
  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.title = createTranslate(settings.language)("siteName");
  }, [settings.language]);

  const value = useMemo(
    () => ({ settings, setTheme, setLanguage }),
    [settings, setTheme, setLanguage],
  );
  return <SettingsContext value={value}>{children}</SettingsContext>;
}
