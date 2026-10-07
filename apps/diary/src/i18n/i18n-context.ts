import { createContext, useContext } from "react";
import type { Language } from "./messages";

export type I18nContextValue = {
  language: Language;
  setLanguage(language: Language): void;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18nContext(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("I18nProvider がありません");
  return value;
}
