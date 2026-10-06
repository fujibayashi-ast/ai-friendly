import {
  type AiTools,
  createAiTools,
  createCommandSession,
} from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useEffect, useState } from "react";
import { siteCommands } from "../commands/site-commands";
import { useConfirm } from "../confirm/use-confirm";
import { useSiteStore } from "./use-site-store";

declare global {
  interface Window {
    /** 開発中だけ: WebMCP がないブラウザでも、同じツールを devtools から呼べるようにする */
    __aiTools?: AiTools;
  }
}

/** サイトに Command のセッションをつなぎ、AI（チャット・WebMCP）から操作できるようにする。描画はしない */
export function Ai() {
  const store = useSiteStore();
  const confirm = useConfirm();
  const [session] = useState(() =>
    createCommandSession({
      store,
      commands: siteCommands,
      // 確認が要る Command は今は reset_settings だけ。増えたら Command の type で文言を分ける
      confirm: () =>
        confirm({
          title: "reset.title",
          description: "reset.description",
          confirmLabel: "reset.confirm",
        }),
    }),
  );

  useEffect(() => {
    const tools = createAiTools(session, { describeState: (state) => state });
    const controller = new AbortController();
    void registerWebMcpTools(tools.all, { signal: controller.signal });
    if (import.meta.env.DEV) window.__aiTools = tools;
    return () => {
      controller.abort();
      if (window.__aiTools === tools) delete window.__aiTools;
    };
  }, [session]);

  return null;
}
