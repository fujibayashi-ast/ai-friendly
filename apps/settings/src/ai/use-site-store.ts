import type { CommandStore } from "@ai-friendly/command";
import { useLayoutEffect, useRef, useState } from "react";
import type { SiteState } from "../commands/site-commands";
import { useI18n } from "../i18n/use-i18n";
import { useTheme } from "../settings/use-theme";

/** サイトの状態と setter（useTheme / useI18n）を、Command のセッションが読み書きできる形にする */
export function useSiteStore(): CommandStore<SiteState> {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useI18n();

  const latest = useRef({ state: { theme, language }, setTheme, setLanguage });
  useLayoutEffect(() => {
    latest.current = { state: { theme, language }, setTheme, setLanguage };
  });

  const [store] = useState<CommandStore<SiteState>>(() => ({
    getState: () => latest.current.state,
    setState(next) {
      // 続けて実行したバッチが、React の再描画を待たずに新しい状態を読めるように
      latest.current.state = next;
      latest.current.setTheme(next.theme);
      latest.current.setLanguage(next.language);
    },
  }));
  return store;
}
