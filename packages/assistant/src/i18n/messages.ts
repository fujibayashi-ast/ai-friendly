const ja = {
  "launcher.open": "AI に頼む",
  "launcher.close": "チャットを閉じる",
  title: "AI アシスタント",
  close: "閉じる",
  empty: "話しかけると、このサイトを操作します。",
  placeholder: "メッセージを入力",
  send: "送信",
  you: "あなた",
  thinking: "考えています…",
  "error.failed": "返事を受け取れませんでした。もう一度送ってください。",
  "error.tooManySteps":
    "操作が多すぎるため止めました。もう少し分けて頼んでください。",
  "tool.done": "完了",
  "tool.failed": "失敗",
  "tool.running": "実行中",
  "scripted.done": "実行しました。",
  "scripted.failed": "うまくいきませんでした。",
  "scripted.fallback":
    "仮の AI のため、決まった言い回しにだけ反応します。例を参考に話しかけてください。",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  "launcher.open": "Ask AI",
  "launcher.close": "Close chat",
  title: "AI assistant",
  close: "Close",
  empty: "Tell me what to change on this site.",
  placeholder: "Type a message",
  send: "Send",
  you: "You",
  thinking: "Thinking…",
  "error.failed": "Couldn't get a reply. Send it again.",
  "error.tooManySteps": "Stopped after too many steps. Ask for less at once.",
  "tool.done": "Done",
  "tool.failed": "Failed",
  "tool.running": "Running",
  "scripted.done": "Done.",
  "scripted.failed": "That didn't work.",
  "scripted.fallback":
    "This stand-in AI only understands set phrases. Try one of the examples.",
};

/** チャットの表示言語。サイトの言語を渡す */
export type ChatLanguage = "ja" | "en";

export const messages: Record<ChatLanguage, Record<MessageKey, string>> = {
  ja,
  en,
};

export type Translate = (key: MessageKey) => string;

export function createTranslate(language: ChatLanguage): Translate {
  return (key) => messages[language][key];
}
