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
import type { ToolCall } from "../providers/provider";
import { ToolCallLine, type ToolCallView } from "./tool-call-line";
import type { ChatEntry, ChatState } from "./use-chat";

export type ChatProps = {
  chat: ChatState;
  t: Translate;
  /** 何も話していないときに出す話しかけ方の例。押すとそのまま送る */
  suggestions?: readonly string[];
  /** ツールの実行の見せ方。既定は Command 名の小さな行 */
  renderToolCall?: ComponentType<ToolCallView>;
  /** 失敗の理由に、LLM 向けの英文のメッセージも出す */
  debug?: boolean;
  inputRef?: Ref<HTMLTextAreaElement>;
};

/** メッセージの一覧と入力欄。置き場所（浮いたパネル・ドロワーなど）には依存しない */
export function Chat({
  chat,
  t,
  suggestions = [],
  renderToolCall: ToolCallView = ToolCallLine,
  debug = false,
  inputRef,
}: ChatProps) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const { running } = chat;
  const results = new Map(
    chat.entries.flatMap((entry) =>
      entry.role === "tool" ? [[entry.toolCallId, entry.result] as const] : [],
    ),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: 新しいメッセージ・状態のたびに下までスクロールする
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [chat.entries, running]);

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
        {chat.entries.length === 0 && (
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
        {chat.entries.map((entry, index) => (
          <EntryView
            // biome-ignore lint/suspicious/noArrayIndexKey: 追記だけで並びが変わらない
            key={index}
            entry={entry}
            results={results}
            t={t}
            debug={debug}
            ToolCallView={ToolCallView}
          />
        ))}
        {running && (
          <p className="text-sm text-muted-foreground motion-safe:animate-pulse">
            {t("thinking")}
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

function EntryView({
  entry: message,
  results,
  t,
  debug,
  ToolCallView,
}: {
  entry: ChatEntry;
  results: ReadonlyMap<string, unknown>;
  t: Translate;
  debug: boolean;
  ToolCallView: ComponentType<ToolCallView>;
}) {
  if (message.role === "tool") return null;
  if (message.role === "notice") {
    return (
      <p className="text-sm text-destructive">
        {t(message.kind === "failed" ? "error.failed" : "error.tooManySteps")}
      </p>
    );
  }
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
          debug={debug}
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
