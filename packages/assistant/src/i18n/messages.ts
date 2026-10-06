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
  "apiKey.note":
    "キーはサーバーを通さず、このブラウザから Claude API に直接送られます。",
  "apiKey.save": "保存",
  "apiKey.change": "キーを変更",
  provider: "使う AI",
  "nano.description":
    "Chrome に入っている Gemini Nano を使います。API キーは要りません。",
  "nano.download": "モデルをダウンロード",
  "nano.downloadNote": "初回だけ、モデル（数 GB）をダウンロードします。",
  "nano.downloading": "ダウンロードしています…",
  "nano.downloadFailed":
    "ダウンロードできませんでした。もう一度試してください。",
  "nano.unavailable":
    "このブラウザでは使えません。パソコン版の Chrome（148 以降）で開いてください。",
  "qwen.description":
    "ブラウザの中で Qwen3.5 4B を動かします。API キーは要りません。",
  "qwen.load": "モデルを読み込む",
  "qwen.note":
    "初回だけ、モデル（約 2.4 GB）をダウンロードします。メモリ 16 GB 程度の端末向けです。",
  "qwen.downloading": "ダウンロードしています…",
  "qwen.loading": "読み込んでいます…",
  "qwen.failed": "読み込めませんでした。もう一度試してください。",
  "qwen.unavailable":
    "このブラウザでは使えません。WebGPU が使えるブラウザ（Chrome・Edge など）で開いてください。",
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
    "The key is sent directly from this browser to the Claude API, not through a server.",
  "apiKey.save": "Save",
  "apiKey.change": "Change key",
  provider: "AI to use",
  "nano.description": "Uses Gemini Nano built into Chrome. No API key needed.",
  "nano.download": "Download the model",
  "nano.downloadNote":
    "The model (a few GB) is downloaded only the first time.",
  "nano.downloading": "Downloading…",
  "nano.downloadFailed": "Couldn't download the model. Try again.",
  "nano.unavailable":
    "Not available in this browser. Open this site in Chrome 148 or later on a computer.",
  "qwen.description": "Runs Qwen3.5 4B inside your browser. No API key needed.",
  "qwen.load": "Load the model",
  "qwen.note":
    "The model (about 2.4 GB) is downloaded only the first time. Needs a device with about 16 GB of memory.",
  "qwen.downloading": "Downloading…",
  "qwen.loading": "Loading…",
  "qwen.failed": "Couldn't load the model. Try again.",
  "qwen.unavailable":
    "Not available in this browser. Open this site in a browser with WebGPU (Chrome, Edge, etc.).",
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
