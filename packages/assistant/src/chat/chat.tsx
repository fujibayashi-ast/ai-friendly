import type { AiTool } from "@ai-friendly/command";
import {
  type ComponentType,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
import { ProviderSelect } from "../ui/provider-select";
import { Suggestions } from "../ui/suggestions";
import { ToolCallLine, type ToolCallLineProps } from "../ui/tool-call-line";
import { UserMessage } from "../ui/user-message";

/** 使う LLM の候補 */
export type ProviderOption = {
  /** 切り替えに出す名前。候補の中で重ならないようにする */
  label: string;
  /** ないと、この候補を選んだときは会話の代わりに `setup` を出す（API キーの入力待ちなど） */
  provider?: ChatProvider;
  /** `provider` がないときに出すもの（`ApiKeyForm` など） */
  setup?: ReactNode;
  /** この候補を選んでいるとき、入力欄の左下（切り替えの隣）に出すもの（「キーを変更」など） */
  actions?: ReactNode;
};

export type ChatProps = {
  /** 使う LLM の候補。2 つ以上あると入力欄の左下で切り替えられる。最初は先頭を使う */
  providers: readonly ProviderOption[];
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
  /** AI が返事を待ち始めたら `true`、終わったら `false` で呼ぶ。サイトがオーバーレイを出すときなどに使う */
  onRunningChange?: (running: boolean) => void;
};

/**
 * チャット（メッセージの一覧と入力欄）。会話の状態を自分で持ち、単体でも使える
 * 置き場所には依存しないので、ページの中・ドロワー・浮いたパネル（`FloatingChat`）などに入れる
 *
 * @example
 * <Chat providers={[{ label: "Claude", provider }]} tools={tools} language="ja" suggestions={["ダークにして"]} />
 * @see docs/assistant.md
 */
export function Chat({
  providers,
  tools,
  language,
  suggestions = [],
  debug = false,
  renderToolCall: ToolCallView = ToolCallLine,
  inputRef,
  onRunningChange,
}: ChatProps) {
  const t = createTranslate(language);
  const [selected, setSelected] = useState(0);
  const option = providers[selected] ?? providers[0];
  const provider = option?.provider;
  const { entries, running, send } = useChat({ provider, tools });

  // 毎回新しい関数が渡されても、running が変わったときだけ呼ぶ
  const latestOnRunningChange = useRef(onRunningChange);
  useLayoutEffect(() => {
    latestOnRunningChange.current = onRunningChange;
  });
  const wasRunning = useRef(running);
  useEffect(() => {
    if (running !== wasRunning.current) {
      latestOnRunningChange.current?.(running);
    }
    wasRunning.current = running;
  }, [running]);
  const listRef = useRef<HTMLDivElement>(null);
  const ownInputRef = useRef<HTMLTextAreaElement>(null);
  const input = inputRef ?? ownInputRef;
  const setupRef = useRef<HTMLDivElement>(null);

  // キーを保存した・変更を押した・LLM を切り替えた、で入力欄が入れ替わるので、新しい入力欄にフォーカスを移す
  const hadProvider = useRef(Boolean(provider));
  useEffect(() => {
    const hasProvider = Boolean(provider);
    if (hasProvider !== hadProvider.current) {
      if (hasProvider) input.current?.focus();
      else focusSetup(setupRef.current);
    }
    hadProvider.current = hasProvider;
  }, [provider, input]);
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

  const providerSelect = (
    <div className="flex items-center gap-1">
      <ProviderSelect
        labels={providers.map((option) => option.label)}
        selected={selected}
        onSelect={setSelected}
        label={t("provider")}
      />
      {option?.actions}
    </div>
  );

  if (!provider) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={setupRef}
          data-chat-setup=""
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {option?.setup}
        </div>
        {providers.length > 1 && (
          <div className="border-t p-3">{providerSelect}</div>
        )}
      </div>
    );
  }

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
                  {entry.content && (
                    <AssistantMessage>{entry.content}</AssistantMessage>
                  )}
                  {entry.toolCalls?.map((call) => (
                    <ToolCallView key={call.id} {...toolCallProps(call)} />
                  ))}
                </div>
              );
            case "notice":
              return <Notice key={key}>{t(noticeMessages[entry.kind])}</Notice>;
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
        start={providerSelect}
      />
    </div>
  );
}

/** `setup` の最初の入力・ボタンにフォーカスを移す。なければ何もしない */
export function focusSetup(root: ParentNode | null | undefined) {
  root
    ?.querySelector<HTMLElement>(
      "[data-chat-setup] input, [data-chat-setup] button",
    )
    ?.focus();
}

const noticeMessages = {
  failed: "error.failed",
  auth: "error.auth",
  too_many_steps: "error.tooManySteps",
} as const;
