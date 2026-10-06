import { defaultSettings, type Settings, settingsSchema } from "./settings";

const STORAGE_KEY = "ai-friendly:settings";

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

export function loadSettings(
  storage: KeyValueStorage | undefined = globalThis.localStorage,
): Settings {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = settingsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(
  settings: Settings,
  storage: KeyValueStorage | undefined = globalThis.localStorage,
): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // プライベートモードなどで保存できなくても、画面の操作は続けられる
  }
}
