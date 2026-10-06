import {
  FloatingChat,
  useClaude,
  useGeminiNano,
  useQwen,
} from "@ai-friendly/assistant";
import { type AiTool, createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useEffect, useMemo, useState } from "react";
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

/** サイトの関数を Command として AI（チャット・WebMCP）から呼べるようにする */
export function Ai() {
  const { theme } = useTheme();
  const { language, t } = useI18n();
  const commands = useSettingsCommands();
  const confirm = useConfirm();

  // 状態が変わるたびにツールを作り直す（get_state が今の設定を返すように）
  const tools = useMemo(
    () =>
      createAiTools({
        commands,
        // 確認が要る Command は今は reset_settings だけ。増えたら command.type で文言を分ける
        confirm: () =>
          confirm({
            title: "reset.title",
            description: "reset.description",
            confirmLabel: "reset.confirm",
          }),
        getState: () => ({ theme, language }),
      }),
    [commands, confirm, theme, language],
  );

  useEffect(() => {
    const controller = new AbortController();
    void registerWebMcpTools(tools, { signal: controller.signal });
    if (import.meta.env.DEV) window.__aiTools = tools;
    return () => {
      controller.abort();
      if (window.__aiTools === tools) delete window.__aiTools;
    };
  }, [tools]);

  // 再読み込みで消える。保存はしない
  const [apiKey, setApiKey] = useState<string | null>(null);
  const claude = useClaude({
    apiKey,
    onApiKeyChange: setApiKey,
    system,
    language,
  });
  const geminiNano = useGeminiNano({ system, language });
  const qwen = useQwen({ system, language });

  return (
    <FloatingChat
      providers={[claude, geminiNano, qwen]}
      tools={tools}
      language={language}
      debug={import.meta.env.DEV}
      suggestions={[
        t("chat.suggest.theme"),
        t("chat.suggest.language"),
        t("chat.suggest.reset"),
      ]}
    />
  );
}

const system =
  'You operate this website for the user by calling the tools. Requests like "make it dark" or "switch to English" are about this website, so use the tools for them. Check the current settings with get_state when you need them. If the user asks about anything other than the settings of this website, say briefly that you can only help with this website. Reply briefly in the same language as the user.';
