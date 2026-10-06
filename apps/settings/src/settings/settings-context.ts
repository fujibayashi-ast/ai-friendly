import { createContext, useContext } from "react";
import type { Language, Settings, Theme } from "./settings";

export type SettingsContextValue = {
  settings: Settings;
  setTheme(theme: Theme): void;
  setLanguage(language: Language): void;
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("SettingsProvider がありません");
  return value;
}
