import {
  FloatingChat,
  useClaude,
  useGeminiNano,
  useQwen,
  webMcpPointer,
} from "@ai-friendly/assistant";
import { type AiTool, createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useEffect, useMemo, useState } from "react";
import { useDiaryCommands } from "../commands/diary-commands";
import { missingFields, sortEntries } from "../diary/diary";
import { useDiary } from "../diary/diary-context";
import { useI18n } from "../i18n/use-i18n";

declare global {
  interface Window {
    /** 開発中だけ: WebMCP がないブラウザでも、同じツールを devtools から呼べるようにする */
    __aiTools?: AiTool[];
  }
}

/** サイトの関数を Command として AI（チャット・WebMCP）から呼べるようにする。操作はカーソルの動きで見せる */
export function Ai() {
  const { entries, draft } = useDiary();
  const { language, t } = useI18n();
  const commands = useDiaryCommands();

  const tools = useMemo(
    () =>
      createAiTools({
        commands,
        getState: () => ({
          writing: {
            ...draft,
            missing: missingFields(draft),
          },
          // 一覧は新しい 5 件だけ（本文は省く）
          recent: sortEntries(entries)
            .slice(0, 5)
            .map(({ title }) => title),
        }),
      }),
    [commands, entries, draft],
  );

  useEffect(() => {
    const controller = new AbortController();
    void registerWebMcpTools(tools, {
      signal: controller.signal,
      pointer: webMcpPointer,
    });
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
  const qwen9b = useQwen({ system, language, model: "9B" });

  return (
    <FloatingChat
      providers={[qwen, qwen9b, geminiNano, claude]}
      tools={tools}
      language={language}
      debug={import.meta.env.DEV}
      suggestions={[t("chat.suggest.rainy"), t("chat.suggest.walk")]}
    />
  );
}

const system =
  "You write diary entries on this diary site with the tools. When the user tells you about their day, call fill_entry once with a short title and a body of 2 to 4 sentences written in the user's language as if the user wrote it (first person, casual). Then call save_entry. If the user asks about anything other than this diary, say briefly that you can only help with this website. Reply briefly in the same language as the user.";
