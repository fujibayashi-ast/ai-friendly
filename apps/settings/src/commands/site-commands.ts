import type { Settings } from "../settings/settings";
import { settingsCommands } from "./settings-commands";

/** AI が読み書きするサイトの状態。機能を増やしたらここに足す */
export type SiteState = Settings;

/** AI が実行できる Command。機能を増やしたらここに足す */
export const siteCommands = [...settingsCommands] as const;
