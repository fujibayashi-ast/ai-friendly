import type { Theme } from "./settings";

/** `<html>` の `.dark` を切り替える。`system` のときは OS の設定に追従し、戻り値で追従をやめる */
export function applyTheme(theme: Theme): () => void {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => {
    const dark = theme === "dark" || (theme === "system" && media.matches);
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  };
  update();
  if (theme !== "system") return () => {};
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}
