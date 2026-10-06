import { useSettings } from "./settings-context";

export function useTheme() {
  const { settings, setTheme } = useSettings();
  return { theme: settings.theme, setTheme };
}
