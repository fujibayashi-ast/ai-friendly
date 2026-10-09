import {
  FloatingChat,
  useClaude,
  useGeminiNano,
  useQwen,
} from "@ai-friendly/assistant";
import { type AiTool, createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { orderQuery, ordersQuery, productsQuery } from "../admin/queries";
import { useAdminCommands } from "../commands/admin-commands";
import { useConfirm } from "../confirm/use-confirm";
import { useI18n } from "../i18n/use-i18n";
import { readCurrentPage } from "../routes/paths";

declare global {
  interface Window {
    /** 開発中だけ: WebMCP がないブラウザでも、同じツールを devtools から呼べるようにする */
    __aiTools?: AiTool[];
  }
}

/** サイトの関数とページ遷移を Command として AI（チャット・WebMCP）から呼べるようにする */
export function Ai() {
  const queryClient = useQueryClient();
  const { language, t } = useI18n();
  const commands = useAdminCommands();
  const confirm = useConfirm();

  // ページもデータも、get_state が呼ばれたときに読む
  const tools = useMemo(
    () =>
      createAiTools({
        commands,
        // 文言は Command の定義が持つ。文言のない確認は出さずに拒否する
        confirm: (_, confirmation) =>
          confirmation ? confirm(confirmation) : false,
        // 今のページと、そのページが取ってきた分（キャッシュ）だけ。ほかは、ページを移ってから読む
        getState: () => {
          const page = currentPage();
          const key =
            page.page === "orders"
              ? ordersQuery(page.filters).queryKey
              : page.page === "order"
                ? orderQuery(page.id).queryKey
                : page.page === "products"
                  ? productsQuery(page.filters).queryKey
                  : undefined;
          if (!key) return page;
          // 取れていなければ "pending"（読み込み中）か "error"
          const data =
            queryClient.getQueryData(key) ??
            queryClient.getQueryState(key)?.status;
          return { ...page, data };
        },
      }),
    [commands, confirm, queryClient],
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
  const qwen9b = useQwen({ system: systemPrompt, language, model: "9B" });

  return (
    <FloatingChat
      providers={[qwen, qwen9b, geminiNano, claude]}
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

/** 今のページ。呼ばれたときの URL から読む（移った直後に続けて呼ばれても、描き直しを待たずに新しいページを返す） */
function currentPage() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const { pathname, search } = window.location;
  return readCurrentPage(pathname.slice(base.length) || "/", search);
}

const systemPrompt =
  "You operate the admin pages of an online shop (orders and products) with the tools. get_state shows only the current page and its visible rows. To find something, open the page with show_orders, show_order or show_products, then read get_state. Search customers by family name only, without honorifics like さん. If a tool returns an error, fix the input or tell the user. If the user asks about anything other than this admin site, say briefly that you can only help with this website. Reply briefly in the same language as the user.";
