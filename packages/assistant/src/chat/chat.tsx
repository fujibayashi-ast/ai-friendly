import { Button, Textarea } from "@ai-friendly/ui";
import { ArrowUp } from "lucide-react";
import {
  type ComponentType,
  type KeyboardEvent,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Translate } from "../i18n/messages";
import type { ChatMessage, ToolCall } from "../providers/provider";
import { resultsAfter } from "./results-after";
import { ToolCallLine, type ToolCallView } from "./tool-call-line";
import type { ChatState } from "./use-chat";

export type ChatProps = {
  chat: ChatState;
  t: Translate;
  /** 何も話していないときに出す話しかけ方の例。押すとそのまま送る */
  suggestions?: readonly string[];
  /** ツールの実行の見せ方。既定は Command 名の小さな行 */
  renderToolCall?: ComponentType<ToolCallView>;
  inputRef?: Ref<HTMLTextAreaElement>;
};

/** メッセージの一覧と入力欄。置き場所（浮いたパネル・ドロワーなど）には依存しない */
export function Chat({
  chat,
  t,
  suggestions = [],
  renderToolCall: ToolCallView = ToolCallLine,
  inputRef,
}: ChatProps) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const running = chat.status === "running";

  // biome-ignore lint/correctness/useExhaustiveDependencies: 新しいメッセージ・状態のたびに下までスクロールする
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [chat.messages, chat.status]);

  const submit = (text: string) => {
    if (running || !text.trim()) return;
    setDraft("");
    void chat.send(text);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 日本語の変換を確定する Enter では送らない
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    submit(draft);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
      >
        {chat.messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((text) => (
                  <Button
                    key={text}
                    variant="outline"
                    size="sm"
                    className="rounded-full font-normal"
                    onClick={() => submit(text)}
                  >
                    {text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
        {chat.messages.map((message, index) => (
          <MessageView
            // biome-ignore lint/suspicious/noArrayIndexKey: メッセージは追記だけで並びが変わらない
            key={index}
            message={message}
            results={resultsAfter(chat.messages, index)}
            t={t}
            ToolCallView={ToolCallView}
          />
        ))}
        {running && (
          <p className="text-sm text-muted-foreground motion-safe:animate-pulse">
            {t("thinking")}
          </p>
        )}
        {(chat.status === "failed" || chat.status === "too_many_steps") && (
          <p className="text-sm text-destructive">
            {t(
              chat.status === "failed" ? "error.failed" : "error.tooManySteps",
            )}
          </p>
        )}
      </div>
      <form
        className="flex items-end gap-2 border-t p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit(draft);
        }}
      >
        <Textarea
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          rows={1}
          className="max-h-32 min-h-10 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          aria-label={t("send")}
          disabled={running || !draft.trim()}
          className="size-10 shrink-0"
        >
          <ArrowUp aria-hidden />
        </Button>
      </form>
    </div>
  );
}

function MessageView({
  message,
  results,
  t,
  ToolCallView,
}: {
  message: ChatMessage;
  results: ReadonlyMap<string, unknown>;
  t: Translate;
  ToolCallView: ComponentType<ToolCallView>;
}) {
  if (message.role === "tool") return null;
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-wrap break-words">
          <span className="sr-only">{t("you")}: </span>
          {message.content}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {message.toolCalls?.map((call: ToolCall) => (
        <ToolCallView
          key={call.id}
          call={call}
          result={results.get(call.id)}
          t={t}
        />
      ))}
      {message.content && (
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
      )}
    </div>
  );
}
