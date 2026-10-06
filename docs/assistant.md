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
| `FloatingChat` | 右下のボタンから開く浮いたパネル。スマホでは画面いっぱいに開く。会話は閉じても残る |
| `Chat` | メッセージの一覧と入力欄。置き場所に依存しないので、ドロワーなど別の入れ物にも入れられる（`useChat` の結果を渡す） |
| `ToolCallLine` | ツールの実行の既定の見せ方。灰色の地のブロックに `✓ set_theme  theme: "dark"`（失敗は ✗ と英文のメッセージ）。`renderToolCall` で差し替えられる |

* 開くと入力欄にフォーカスし、Esc か × で閉じてボタンにフォーカスを戻す
* Enter で送信、Shift+Enter で改行。日本語の変換を確定する Enter では送らない
* 実行中は「考えています…」を出し、送信できない
* 確認が要る Command は、アプリが `createAiTools` に渡した `confirm` で確認する（チャット内の確認は #10）
* ツールの結果は、AI のメッセージの直後に続く `tool` メッセージから探す（ローカル LLM などはターンをまたいで同じ ID を使うことがあるため）

## 文言

チャットの文言は assistant が ja / en で持つ。`language` にサイトの言語を渡す。話しかけ方の例（`suggestions`）はサイトごとに違うので、サイトが自分の i18n で渡す。
