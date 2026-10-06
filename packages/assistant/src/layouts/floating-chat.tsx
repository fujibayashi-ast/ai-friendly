import type { AiTool } from "@ai-friendly/command";
import { Button, cn } from "@ai-friendly/ui";
import { MessageCircle, X } from "lucide-react";
import { type ComponentType, useEffect, useId, useRef, useState } from "react";
import { Chat } from "../chat/chat";
import type { ToolCallView } from "../chat/tool-call-line";
import { useChat } from "../chat/use-chat";
import { type ChatLanguage, createTranslate } from "../i18n/messages";
import type { ChatProvider } from "../providers/provider";

export type FloatingChatProps = {
  provider: ChatProvider;
  tools: readonly AiTool[];
  language: ChatLanguage;
  suggestions?: readonly string[];
  renderToolCall?: ComponentType<ToolCallView>;
  /** 失敗の理由に、LLM 向けの英文のメッセージも出す（開発中など） */
  debug?: boolean;
};

/**
 * 右下のボタンから開く、浮いたチャットのパネル。スマホでは画面いっぱいに開く
 *
 * @example
 * <FloatingChat provider={provider} tools={tools} language="ja" suggestions={["ダークにして"]} />
 * @see docs/assistant.md
 */
export function FloatingChat({
  provider,
  tools,
  language,
  suggestions,
  renderToolCall,
  debug,
}: FloatingChatProps) {
  const t = createTranslate(language);
  const chat = useChat({ provider, tools });
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    // スマホでは開いている間ボタンを隠すので、閉じて描画し直した後に戻す
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-labelledby={titleId}
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
          className="fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:right-4 sm:bottom-22 sm:h-[560px] sm:max-h-[calc(100dvh-7.5rem)] sm:w-[380px] sm:rounded-xl sm:border sm:shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 sm:origin-bottom-right"
        >
          <header className="flex h-14 shrink-0 items-center justify-between border-b pr-2 pl-4">
            <h2 id={titleId} className="font-semibold">
              {t("title")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("close")}
              onClick={close}
            >
              <X aria-hidden />
            </Button>
          </header>
          <Chat
            chat={chat}
            t={t}
            suggestions={suggestions}
            renderToolCall={renderToolCall}
            debug={debug}
            inputRef={inputRef}
          />
        </section>
      )}
      <button
        ref={launcherRef}
        type="button"
        aria-label={t(open ? "launcher.close" : "launcher.open")}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          "fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform outline-none hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
          open && "max-sm:hidden",
        )}
      >
        {open ? (
          <X aria-hidden className="size-6" />
        ) : (
          <MessageCircle aria-hidden className="size-6" />
        )}
      </button>
    </>
  );
}
