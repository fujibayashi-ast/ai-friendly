import type { Theme } from "./settings";

/** `<html>` の `.dark` と `color-scheme` を切り替える */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}
