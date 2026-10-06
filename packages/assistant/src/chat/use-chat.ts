import type { AiTool } from "@ai-friendly/command";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ChatMessage, ChatProvider } from "../providers/provider";
import { runChat } from "./run-chat";

export type ChatStatus = "idle" | "running" | "failed" | "too_many_steps";

export type ChatState = {
  messages: readonly ChatMessage[];
  status: ChatStatus;
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
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const history = useRef<readonly ChatMessage[]>([]);
  const running = useRef(false);
  const latest = useRef({ provider, tools });
  useLayoutEffect(() => {
    latest.current = { provider, tools };
  });

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || running.current) return;
    running.current = true;

    const append = (message: ChatMessage) => {
      history.current = [...history.current, message];
      setMessages(history.current);
    };
    append({ role: "user", content });
    setStatus("running");
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
      setStatus(result === "done" ? "idle" : "too_many_steps");
    } catch {
      setStatus("failed");
    } finally {
      running.current = false;
    }
  }, []);

  return { messages, status, send };
}
