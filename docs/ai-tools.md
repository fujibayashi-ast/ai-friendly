# AI 向けツールと WebMCP

Command の定義から AI 向けのツールを作り、WebMCP（ブラウザの AI エージェント）に登録する。サイト内のチャット（`@ai-friendly/assistant`）も同じツールを使う。Command そのものの仕様は [commands.md](commands.md)。

```mermaid
flowchart LR
  Defs["Command の定義<br>（run でサイトの関数を呼ぶ）"] --> Tools["createAiTools"]
  Tools --> WebMCP["registerWebMcpTools<br>（ブラウザの AI エージェント）"]
  Tools --> Chat["assistant のチャット<br>（ローカル LLM / Claude API）"]
```

## 使い方

```ts
import { createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";

const tools = createAiTools({
  commands: [addTodoCommand, deleteTodoCommand],
  confirm: (command, confirmation) =>
    window.confirm(confirmation?.title ?? `Run ${command.type}?`),
  getState: () => todos.map(({ id, title, done }) => ({ id, title, done })),
});

const controller = new AbortController();
const registered = await registerWebMcpTools(tools, { signal: controller.signal });
// 状態が変わってツールを作り直すとき・画面を離れるときに解除する
controller.abort();
```

## ツール（`createAiTools`）

`AiTool[]` を返す。

| ツール | 中身 |
| --- | --- |
| Command ごと（ツール名は Command の `type`） | Command を 1 つ実行する。`inputSchema` は `z.toJSONSchema(args, { io: "input" })`。確認が要る Command は説明の末尾に `[asks the user to confirm]`（`requiresConfirmation` が関数なら `[may ask the user to confirm]`）が付く |
| `get_state` | `getState()` の結果を返す。`readOnlyHint: true`。`getState` を渡したときだけ作る |

* 実行は「引数の検証 → 確認 → `run`」の順に進む（[commands.md](commands.md) の「実行の流れ」）
* 戻り値は `ExecuteResult`（`{ ok: true }` / `{ ok: true, message }` / `{ ok: false, code, message }`）
* `execute(input, { pointer })` の 2 つ目は、実行する側が渡すもの。サイト内のチャットはカーソル（`pointer`）を渡す（[commands.md](commands.md) の「押すふり・打ち込むふり」）
* `getState` は、AI が Command を組み立てるのに要る情報だけを返す（全部渡すとトークンが増える）
* Command の `type` を `get_state` にしない（ツール名がぶつかる）

## WebMCP への登録（`@ai-friendly/command/webmcp`）

* `document.modelContext` を使い、なければ `navigator.modelContext`（Chromium 150 で deprecated）を使う
* WebMCP が使えないブラウザでは何もせず `false` を返す
* 公開先では Chrome の origin trial のトークンを付けているので、フラグなしで使える（[deploy.md](deploy.md#webmcp-の-origin-trial_headers)）
* 解除は `signal` を abort する（WebMCP には `unregisterTool` がない）
* WebMCP は `execute` の 2 つ目に自分の client を渡すので、入力と `pointer` だけを渡すように包んで登録する
* `pointer` を渡すと、チャットと同じく Command が押すふり・打ち込むふりをする（カーソルは `@ai-friendly/assistant` の `webMcpPointer`。[assistant.md](assistant.md#ai-の操作を見せるカーソル)）。渡さなければ動きなし
* 登録の途中で abort されたとき（React の StrictMode・ツールの作り直し）は、残りの登録をやめて `false` を返す。abort による失敗は投げない（abort 以外の失敗は投げる）
* WebMCP の仕様はまだ変わるため、登録まわりはこのサブパスに閉じ込めている
