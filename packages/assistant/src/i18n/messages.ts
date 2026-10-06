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
  "error.auth": "API キーが正しくありません。キーを変更してください。",
  "error.tooManySteps":
    "操作が多すぎるため止めました。もう少し分けて頼んでください。",
  "tool.done": "完了",
  "tool.failed": "失敗",
  "tool.running": "実行中",
  "tool.rejected": "やめました",
  "tool.error": "実行できませんでした",
  "apiKey.description":
    "Claude の API キーを入れると、AI に頼めるようになります。",
  "apiKey.label": "Claude の API キー",
  "apiKey.note": "キーはこのタブの中だけに保存され、閉じると消えます。",
  "apiKey.save": "保存",
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
  "error.auth": "The API key is invalid. Change the key.",
  "error.tooManySteps": "Stopped after too many steps. Ask for less at once.",
  "tool.done": "Done",
  "tool.failed": "Failed",
  "tool.running": "Running",
  "tool.rejected": "Cancelled",
  "tool.error": "Couldn't run this",
  "apiKey.description": "Enter your Claude API key to ask the AI.",
  "apiKey.label": "Claude API key",
  "apiKey.note":
    "The key is kept only in this tab and is removed when you close it.",
  "apiKey.save": "Save",
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
