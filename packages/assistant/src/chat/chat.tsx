import type { AiTool } from "@ai-friendly/command";
import { type ComponentType, type RefObject, useEffect, useRef } from "react";
import {
  failureMessage,
  isFailure,
  isRejected,
} from "../conversation/tool-result";
import { useChat } from "../conversation/use-chat";
import { type ChatLanguage, createTranslate } from "../i18n/messages";
import type { ChatProvider, ToolCall } from "../providers/provider";
import { AssistantMessage } from "../ui/assistant-message";
import { Composer } from "../ui/composer";
import { Notice } from "../ui/notice";
import { Suggestions } from "../ui/suggestions";
import { ToolCallLine, type ToolCallLineProps } from "../ui/tool-call-line";
import { UserMessage } from "../ui/user-message";

export type ChatProps = {
  provider: ChatProvider;
  /** `createAiTools` の結果。作り直されてよい（会話のループは毎回最新を使う） */
  tools: readonly AiTool[];
  language: ChatLanguage;
  /** 何も話していないときに出す話しかけ方の例。押すとそのまま送る */
  suggestions?: readonly string[];
  /** 失敗の理由に、LLM 向けの英文のメッセージも出す（開発中など） */
  debug?: boolean;
  /** ツールの実行の見せ方。既定は `ToolCallLine` */
  renderToolCall?: ComponentType<ToolCallLineProps>;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
};

/**
 * チャット（メッセージの一覧と入力欄）。会話の状態を自分で持ち、単体でも使える
 * 置き場所には依存しないので、ページの中・ドロワー・浮いたパネル（`FloatingChat`）などに入れる
 *
 * @example
 * <Chat provider={provider} tools={tools} language="ja" suggestions={["ダークにして"]} />
 * @see docs/assistant.md
 */
export function Chat({
  provider,
  tools,
  language,
  suggestions = [],
  debug = false,
  renderToolCall: ToolCallView = ToolCallLine,
  inputRef,
}: ChatProps) {
  const t = createTranslate(language);
  const { entries, running, send } = useChat({ provider, tools });
  const listRef = useRef<HTMLDivElement>(null);
  const ownInputRef = useRef<HTMLTextAreaElement>(null);
  const input = inputRef ?? ownInputRef;
  const results = new Map(
    entries.flatMap((entry) =>
      entry.role === "tool" ? [[entry.toolCallId, entry.result] as const] : [],
    ),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: 新しいメッセージ・状態のたびに下までスクロールする
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [entries, running]);

  const toolCallProps = (call: ToolCall): ToolCallLineProps => {
    const result = results.get(call.id);
    if (result === undefined) {
      return { ...call, status: "running", statusLabel: t("tool.running") };
    }
    if (!isFailure(result)) {
      return { ...call, status: "done", statusLabel: t("tool.done") };
    }
    return {
      ...call,
      status: "failed",
      statusLabel: t("tool.failed"),
      error: t(isRejected(result) ? "tool.rejected" : "tool.error"),
      detail: debug ? failureMessage(result) : undefined,
    };
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
      >
        {entries.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
            {suggestions.length > 0 && (
              <Suggestions
                items={suggestions}
                onSelect={(text) => {
                  void send(text);
                  // 押した例は消えるので、入力欄にフォーカスを移す
                  input.current?.focus();
                }}
              />
            )}
          </div>
        )}
        {entries.map((entry, index) => {
          const key = index;
          switch (entry.role) {
            case "user":
              return (
                <UserMessage key={key} label={t("you")}>
                  {entry.content}
                </UserMessage>
              );
            case "assistant":
              return (
                <div key={key} className="flex flex-col gap-2">
                  {entry.toolCalls?.map((call) => (
                    <ToolCallView key={call.id} {...toolCallProps(call)} />
                  ))}
                  {entry.content && (
                    <AssistantMessage>{entry.content}</AssistantMessage>
                  )}
                </div>
              );
            case "notice":
              return (
                <Notice key={key}>
                  {t(
                    entry.kind === "failed"
                      ? "error.failed"
                      : "error.tooManySteps",
                  )}
                </Notice>
              );
            default:
              return null;
          }
        })}
        {running && (
          <p className="text-sm text-muted-foreground motion-safe:animate-pulse">
            {t("thinking")}
          </p>
        )}
      </div>
      <Composer
        placeholder={t("placeholder")}
        sendLabel={t("send")}
        disabled={running}
        onSubmit={(text) => void send(text)}
        inputRef={input}
      />
    </div>
  );
}
