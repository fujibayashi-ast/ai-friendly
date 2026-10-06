import type { AiTool } from "@ai-friendly/command";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ChatMessage, ChatProvider } from "../providers/provider";
import { runChat } from "./run-chat";

/** 画面にだけ出すお知らせ（LLM には送らない） */
export type ChatNotice = {
  role: "notice";
  kind: "failed" | "too_many_steps";
};

/** 画面に並べるもの: 会話のメッセージとお知らせ */
export type ChatEntry = ChatMessage | ChatNotice;

export type ChatState = {
  entries: readonly ChatEntry[];
  running: boolean;
  send(text: string): Promise<void>;
};

/**
 * 会話の状態を持ち、送信したら会話のループを回す
 * `provider` と `tools` は作り直されてよい（ループはステップごとに最新を使う）
 */
export function useChat({
  provider,
  tools,
}: {
  provider: ChatProvider;
  tools: readonly AiTool[];
}): ChatState {
  const [entries, setEntries] = useState<readonly ChatEntry[]>([]);
  const [running, setRunning] = useState(false);
  const history = useRef<readonly ChatMessage[]>([]);
  const busy = useRef(false);
  const latest = useRef({ provider, tools });
  useLayoutEffect(() => {
    latest.current = { provider, tools };
  });

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || busy.current) return;
    busy.current = true;

    const show = (entry: ChatEntry) => setEntries((list) => [...list, entry]);
    const append = (message: ChatMessage) => {
      history.current = [...history.current, message];
      show(message);
    };
    append({ role: "user", content });
    setRunning(true);
    try {
      const result = await runChat({
        // 言語の切り替えなどでプロバイダが作り直されても、次のステップから最新を使う
        provider: {
          complete: (request) => latest.current.provider.complete(request),
        },
        messages: history.current,
        getTools: () => latest.current.tools,
        onMessage: append,
      });
      if (result === "too_many_steps") {
        show({ role: "notice", kind: "too_many_steps" });
      }
    } catch {
      show({ role: "notice", kind: "failed" });
    } finally {
      busy.current = false;
      setRunning(false);
    }
  }, []);

  return { entries, running, send };
}
