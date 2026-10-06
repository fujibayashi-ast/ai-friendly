import { Button, cn } from "@ai-friendly/ui";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Chat, type ChatProps } from "../chat/chat";
import { createTranslate } from "../i18n/messages";

export type FloatingChatProps = Omit<ChatProps, "inputRef">;

/**
 * 右下のボタンから開く、浮いたチャットのパネル。スマホでは画面いっぱいに開く
 * 閉じてもパネルは隠すだけなので、会話は残る
 *
 * @example
 * <FloatingChat provider={provider} tools={tools} language="ja" suggestions={["ダークにして"]} />
 * @see docs/assistant.md
 */
export function FloatingChat(props: FloatingChatProps) {
  const t = createTranslate(props.language);
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

  return (
    <>
      <section
        role="dialog"
        aria-labelledby={titleId}
        hidden={!open}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:right-4 sm:bottom-22 sm:h-[560px] sm:max-h-[calc(100dvh-7.5rem)] sm:w-[380px] sm:rounded-xl sm:border sm:shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 sm:origin-bottom-right",
          !open && "hidden",
        )}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b pr-2 pl-4">
          <h2 id={titleId} className="font-semibold">
            {t("title")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          >
            <X aria-hidden />
          </Button>
        </header>
        <Chat {...props} inputRef={inputRef} />
      </section>
      <button
        ref={launcherRef}
        type="button"
        aria-label={t(open ? "launcher.close" : "launcher.open")}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
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
