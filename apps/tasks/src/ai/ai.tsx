import {
  FloatingChat,
  useClaude,
  useGeminiNano,
  useQwen,
} from "@ai-friendly/assistant";
import { type AiTool, createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useEffect, useMemo, useState } from "react";
import { useTasksCommands } from "../commands/tasks-commands";
import { useConfirm } from "../confirm/use-confirm";
import { useI18n } from "../i18n/use-i18n";
import { useTasks } from "../tasks/tasks-context";

declare global {
  interface Window {
    /** 開発中だけ: WebMCP がないブラウザでも、同じツールを devtools から呼べるようにする */
    __aiTools?: AiTool[];
  }
}

/** サイトの関数を Command として AI（チャット・WebMCP）から呼べるようにする */
export function Ai() {
  const { tasks } = useTasks();
  const { language, t } = useI18n();
  const commands = useTasksCommands();
  const confirm = useConfirm();

  // 状態が変わるたびにツールを作り直す（get_state が今のやることを返すように）
  const tools = useMemo(
    () =>
      createAiTools({
        commands,
        // 文言は Command の定義が持つ。文言のない確認は出さずに拒否する
        confirm: (_, confirmation) =>
          confirmation ? confirm(confirmation) : false,
        getState: () => ({ tasks }),
      }),
    [commands, confirm, tasks],
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
        t("chat.suggest.add"),
        t("chat.suggest.done"),
        t("chat.suggest.clear"),
      ]}
    />
  );
}

const system =
  "You operate this to-do list website for the user by calling the tools. Find the IDs of the to-dos with get_state before changing or deleting them. If the user asks about anything other than this to-do list, say briefly that you can only help with this website. Reply briefly in the same language as the user.";
