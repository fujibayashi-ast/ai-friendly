# サイト内の AI チャット（`@ai-friendly/assistant`）

AI 向けツール（[ai-tools.md](ai-tools.md) の `createAiTools`）を使って、サイトをチャットから操作する。チャットの裏で動く LLM はプロバイダとして差し替える。

```mermaid
flowchart LR
  User["ユーザー"] --> Chat["FloatingChat<br>（チャット UI）"]
  Chat --> Loop["runChat<br>（会話のループ）"]
  Loop -- "messages + tools" --> Provider["ChatProvider<br>（仮のボット / LLM）"]
  Provider -- "返事 / ツールの呼び出し" --> Loop
  Loop -- "tool.execute(input)" --> Tools["AI 向けツール<br>（検証 → 確認 → run）"]
```

## 使い方

```tsx
import { createScriptedProvider, FloatingChat } from "@ai-friendly/assistant";

const provider = createScriptedProvider({ rules, language });

<FloatingChat
  provider={provider}
  tools={tools} // createAiTools の結果
  language={language} // "ja" | "en"。チャットの文言の言語
  suggestions={["ダークにして", "英語にして"]} // 何も話していないときに出す例
  debug={import.meta.env.DEV} // 失敗の理由に LLM 向けの英文も出す（開発中だけなど）
/>;
```

アプリの CSS で、Tailwind に assistant のクラスを拾わせる:

```css
@source "../../../packages/assistant/src";
```

## 会話のループ（`runChat`）

1. プロバイダに会話（`messages`）とツール（`tools`）を渡す
2. 返事にツールの呼び出し（`toolCalls`）があれば、ツールを実行し、結果を `tool` メッセージとして会話に足す
3. ツールの呼び出しがなくなるまで 1〜2 を繰り返す。上限は 5 ステップ（超えたら止めて知らせる）

* `provider` と `tools` は、ステップごとに最新を読む。React では、状態が変わるとツール（`get_state` など）が作り直されるため
* ツールの呼び出しの `id` は、会話の中で一意にする（プロバイダの責任。画面はこの `id` で結果を探す）
* 知らないツールを呼んだときは、使えるツールを添えた英文のエラーを結果として返す（LLM が自分で直せるように）

```ts
type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; toolCalls?: ToolCall[] }
  | { role: "tool"; toolCallId: string; result: unknown };

type ChatProvider = {
  complete(request: { messages: ChatMessage[]; tools: AiTool[] }): Promise<{ content: string; toolCalls?: ToolCall[] }>;
};
```

## プロバイダ

| プロバイダ | 内容 |
| --- | --- |
| `createScriptedProvider({ rules, language })` | 通信しない仮のボット。入力が `rules` の `pattern` に合ったツールをすべて呼び、結果を見て短く返事する。合わなければ「決まった言い回しにだけ反応する」と返す |

* 本物の LLM（ローカル LLM / Claude API）は #27 で足す

```ts
const rules: ScriptedRule[] = [
  { pattern: /ダーク|dark/i, tool: "set_theme", input: { theme: "dark" } },
  { pattern: /リセット|reset/i, tool: "reset_settings" },
];
```

## 画面

| 部品 | 内容 |
| --- | --- |
| `Chat` | メッセージの一覧と入力欄。会話の状態を自分で持ち、単体で使える（`<Chat provider tools language />`）。置き場所に依存しないので、ページの中・ドロワーなどにも入れられる |
| `FloatingChat` | `Chat` を右下のボタンから開く浮いたパネルに入れる。スマホでは画面いっぱいに開く。閉じてもパネルは隠すだけなので、会話は残る |
| `ToolCallLine` | ツールの実行の既定の見せ方。`✓ set_theme(theme: "dark")` のブロックで、実行中は灰、成功は黄、失敗は赤の地。失敗は「やめました」（確認で拒否）/「実行できませんでした」と出し、`debug` のときは LLM 向けの英文のメッセージも出す。`renderToolCall` で差し替えられる（`ToolCallLineProps` を受け取る） |

### ファイルの構成

```
src/
  chat/chat.tsx              # Chat: 会話の状態（useChat）と ui の部品を組み立てる
  layouts/floating-chat.tsx  # FloatingChat: Chat を右下のパネルに入れる
  ui/                        # 見た目だけの部品。props だけで描画し、会話の状態や i18n を知らない
  conversation/              # 会話の状態（useChat）とループ（runChat）。画面なし
  providers/                 # プロバイダの型と仮のボット
  i18n/                      # チャットの文言（ja / en）
```

* 開くと入力欄にフォーカスし、Esc か × で閉じてボタンにフォーカスを戻す
* 話しかけ方の例を押すと、例は消えるので入力欄にフォーカスを移す
* Enter で送信、Shift+Enter で改行。日本語の変換を確定する Enter では送らない
* 実行中は「考えています…」を出し、送信できない
* 返事を受け取れなかった・ステップ数の上限で止めた、は会話の流れの中にお知らせとして残す（LLM には送らない）
* 確認が要る Command は、アプリが `createAiTools` に渡した `confirm` で確認する（チャット内の確認は #10）

## 文言

チャットの文言は assistant が ja / en で持つ。`language` にサイトの言語を渡す。話しかけ方の例（`suggestions`）はサイトごとに違うので、サイトが自分の i18n で渡す。
