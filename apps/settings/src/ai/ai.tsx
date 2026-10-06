import { type AiTool, createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useEffect } from "react";
import { useSettingsCommands } from "../commands/settings-commands";
import { useConfirm } from "../confirm/use-confirm";
import { useI18n } from "../i18n/use-i18n";
import { useTheme } from "../settings/use-theme";

declare global {
  interface Window {
    /** 開発中だけ: WebMCP がないブラウザでも、同じツールを devtools から呼べるようにする */
    __aiTools?: AiTool[];
  }
}

/** サイトの関数を Command として AI（チャット・WebMCP）から呼べるようにする。描画はしない */
export function Ai() {
  const { theme } = useTheme();
  const { language } = useI18n();
  const commands = useSettingsCommands();
  const confirm = useConfirm();

  // 状態が変わるたびにツールを作り直し、登録し直す
  useEffect(() => {
    const tools = createAiTools({
      commands,
      // 確認が要る Command は今は reset_settings だけ。増えたら command.type で文言を分ける
      confirm: () =>
        confirm({
          title: "reset.title",
          description: "reset.description",
          confirmLabel: "reset.confirm",
        }),
      getState: () => ({ theme, language }),
    });
    const controller = new AbortController();
    void registerWebMcpTools(tools, { signal: controller.signal });
    if (import.meta.env.DEV) window.__aiTools = tools;
    return () => {
      controller.abort();
      if (window.__aiTools === tools) delete window.__aiTools;
    };
  }, [commands, confirm, theme, language]);

  return null;
}
