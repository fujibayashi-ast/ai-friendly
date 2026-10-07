import {
  FloatingChat,
  useClaude,
  useGeminiNano,
  useQwen,
} from "@ai-friendly/assistant";
import { type AiTool, createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { useAdmin } from "../admin/admin-context";
import { useAdminCommands } from "../commands/admin-commands";
import { useConfirm } from "../confirm/use-confirm";
import { useI18n } from "../i18n/use-i18n";
import { readCurrentPage } from "../routes/paths";
import { pageState } from "./page-state";

declare global {
  interface Window {
    /** 開発中だけ: WebMCP がないブラウザでも、同じツールを devtools から呼べるようにする */
    __aiTools?: AiTool[];
  }
}

/** サイトの関数とページ遷移を Command として AI（チャット・WebMCP）から呼べるようにする */
export function Ai() {
  const { state } = useAdmin();
  const { pathname, search } = useLocation();
  const { language, t } = useI18n();
  const commands = useAdminCommands();
  const confirm = useConfirm();

  // ページ・状態が変わるたびにツールを作り直す（get_state が今のページを返すように）
  const tools = useMemo(
    () =>
      createAiTools({
        commands,
        // 文言は Command の定義が持つ。文言のない確認は出さずに拒否する
        confirm: (_, confirmation) =>
          confirmation ? confirm(confirmation) : false,
        // 画面に見えている行だけ。ほかの行は、ページを移ってから読む
        getState: () =>
          pageState(state, readCurrentPage(pathname, search), language),
      }),
    [commands, confirm, state, pathname, search, language],
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
    system: systemPrompt,
    language,
  });
  const geminiNano = useGeminiNano({ system: systemPrompt, language });
  const qwen = useQwen({ system: systemPrompt, language });

  return (
    <FloatingChat
      providers={[claude, geminiNano, qwen]}
      tools={tools}
      language={language}
      debug={import.meta.env.DEV}
      suggestions={[
        t("chat.suggest.ship"),
        t("chat.suggest.stock"),
        t("chat.suggest.pending"),
      ]}
    />
  );
}

const systemPrompt =
  "You operate the admin pages of an online shop (orders and products) with the tools. get_state shows only the current page and its visible rows. To find something, open the page with show_orders, show_order or show_products, then read get_state. Search customers by family name only, without honorifics like さん. If a tool returns an error, fix the input or tell the user. If the user asks about anything other than this admin site, say briefly that you can only help with this website. Reply briefly in the same language as the user.";
