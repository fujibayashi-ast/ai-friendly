# Command 基盤（`@ai-friendly/command`）

Command を検証・実行し、Undo / Redo できるようにする。AI チャット・WebMCP（画面の操作も、望むなら）はここを通す。React / LLM には依存しない。

状態はセッションが持つ（`initialState`）か、アプリが持つものを読み書きする（`store`。下の「アプリの状態につなぐ」）。

## 使い方

```ts
import { createCommandSession, defineCommand } from "@ai-friendly/command";
import { z } from "zod";

const addTodo = defineCommand({
  type: "add_todo",
  description: "Add a todo",
  args: z.object({ id: z.string(), title: z.string() }),
  apply(state: TodoState, args) {
    // args は { id: string; title: string } に推論される
    return { ok: true, state: { todos: [...state.todos, { ...args, done: false }] } };
  },
});

const session = createCommandSession({
  initialState: { todos: [] },
  commands: [addTodo, deleteTodo],
  confirm: (commands) => window.confirm(`AI wants to run ${commands.length} commands`),
});

await session.execute({ type: "add_todo", id: crypto.randomUUID(), title: "Buy milk" });
await session.executeRaw(jsonFromLlm, "ai");
```

## Command の定義（`defineCommand`）

| 項目 | 内容 |
| --- | --- |
| `type` | Command 名。snake_case の動詞始まり（`add_todo`） |
| `description` | 何をするか（英文）。AI 向けのツール説明に使う |
| `args` | 引数の定義（下の「引数の書き方」） |
| `requiresConfirmation` | AI が実行するときに確認フックで承認を得るか。`true` / `false`、または `(state, args) => boolean`（下の「条件付きの確認」） |
| `apply(state, args)` | 新しい状態を `{ ok: true, state }` で返す。ドメイン上のエラー（存在しない ID など）は `{ ok: false, message }` で返す。`state` は書き換えず、新しいオブジェクトを返す |

* ID は Command を発行する側で決める（`apply` の中で生成しない）。同じ Command 列なら同じ状態になるようにするため

### 条件付きの確認

```ts
const deleteTodo = defineCommand({
  type: "delete_todo",
  // ...
  apply(state: TodoState, args) { /* ... */ },
  // 未完了の TODO を消すときだけ確認する
  requiresConfirmation: (state, args) => !state.todos.find((t) => t.id === args.id)?.done,
});
```

* `state` はセッションが渡す、バッチ実行前の状態。React の state を閉じ込めないので、定義はコンポーネントの外で 1 回作ればよい
* バッチの中で前の Command が状態を変えても、判定は実行前の状態で行う（`[complete_todo, delete_todo]` は「未完了の削除」として確認する）。確認が余分に出る方向にずれる
* 関数で書くときは `apply` より後に書く。前に書くと、状態の型を `apply` の注釈から推論できず `unknown` になる
* 確認するかを LLM に決めさせない。確認は AI の間違いへの守りなので、条件はコードで決める

### 引数の書き方

zod（v4）のオブジェクトで書く。同じ定義を、検証・WebMCP の `inputSchema`（`z.toJSONSchema(args, { io: "input" })`。`default` のある項目を必須にしないため入力側で出す）・AI 向けの短い一覧に使う。

```ts
args: z.object({
  id: z.string(),
  title: z.string().describe("Shown in the list"),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "high"]).default("low"),
}),
```

* `apply` の `args` は検証後の値（zod の出力の型）。`default` などはここで反映される
* `execute` に渡す Command は zod の入力の型（`default` のある項目は省略できる）
* 一番外側は定義にないフィールドをエラーにする（`.strict()` で検証する）。入れ子の `z.object` で同じようにしたいときは `z.strictObject` を使う
* `.describe()` の説明は WebMCP の `inputSchema` と AI 向けの一覧に載る
* Command は `{ type, ...args }` の平らな形で渡す
* 引数のない Command は `args: z.object({})` と書き、`execute({ type: "reset_settings" })` で実行する

## セッション（`createCommandSession`）

| メソッド | 内容 |
| --- | --- |
| `execute(commands, source = "user")` | 定義済みの Command だけを受け取る（型で検査）。戻り値は `Promise<ExecuteResult>` |
| `executeRaw(input, source)` | 型の分からない入力（LLM の JSON など）を受け取る。検証は `execute` と同じ |
| `undo()` / `redo()` | バッチ単位で戻す / やり直す |
| `canUndo()` / `canRedo()` | 戻せるか / やり直せるか |
| `getState()` | 今の状態。`initialState` のときは変わらない限り同じ参照を返す。`store` のときは `store.getState()` |
| `getHistory()` | 実行したバッチ（`{ commands, source }`）の一覧。Undo したものは含まない |
| `subscribe(listener)` | Command の実行・Undo / Redo で状態が変わったら呼ぶ。戻り値は解除する関数。`store` の外での変更は通知しない |

## アプリの状態につなぐ（`store`）

すでに状態を持っているサイトに、AI からの操作を足すときに使う。サイトの状態の持ち主はアプリのままで、セッションは読み書きするだけ。セッションを外してもサイトは動く。

```ts
const session = createCommandSession({
  store: {
    getState: () => current, // アプリの今の状態
    setState: (next) => apply(next), // アプリの setter に書く
  },
  commands: [setTheme, setLanguage],
  confirm,
});
```

* `initialState` と `store` はどちらか一方だけ渡す
* セッションは実行のたびに `store.getState()` を読む（確認の判定・`apply` の起点）。成功したら `store.setState(next)` を 1 回呼ぶ
* `getState()` は、`setState` の直後に呼ばれても新しい状態を返すようにする（React の state の反映を待つと、続けて実行したバッチが古い状態から始まるため。ref などで持つ）
* 画面の操作は Command を通さず、アプリの setter を直接呼んでよい。その操作は Command の履歴に残らない


## 実行の流れ

```mermaid
flowchart TD
  A["execute / executeRaw"] --> B{"検証"}
  B -- 失敗 --> E1["invalid_command"]
  B -- OK --> C{"source が ai で<br>確認が必要な Command を含む？"}
  C -- はい --> D{"confirm で承認？"}
  D -- いいえ / confirm なし --> E2["rejected"]
  D -- はい --> F
  C -- いいえ --> F["先頭から apply"]
  F -- 1 つでも失敗 --> E3["domain_error（状態は変えない）"]
  F -- すべて成功 --> G["履歴に積む・Redo を消す・通知"]
```

* Command 1 つでも配列でもよい。配列は 1 バッチとして扱い、Undo 1 回で戻る。空の配列はエラー
* バッチの途中で失敗したら、状態は実行前のまま変えない
* 確認はバッチにつき 1 回。検証は確認の前に済ませる
* 確認の画面（ダイアログ・チャット内での確認など）はアプリが `confirm` で決める。Command ごとに出し分けたいときは `confirm` の中で `command.type` を見る
* `apply` は確認の後に、その時点の状態に対して行う

## 結果とエラー

```ts
type ExecuteResult = { ok: true } | { ok: false; code: ErrorCode; message: string };
```

| `code` | いつ | `message` の例 |
| --- | --- | --- |
| `invalid_command` | 形が違う | `commands[1]: unknown command "add_itme" (available: add_todo, delete_todo)` |
| | | `commands[0]: unknown field "name" in add_todo (fields: id, title)` |
| | | `commands[0]: missing required field "title" in add_todo` |
| | | `commands[0].tags[1]: Invalid input: expected string, received null` |
| | | `commands[0].level: Invalid option: expected one of "low"\|"high"` |
| `domain_error` | `apply` が失敗した | `commands[1] (add_todo): todo "1" already exists` |
| `rejected` | 確認で拒否された / `confirm` がない | `commands: rejected by the user` |
| `nothing_to_undo` / `nothing_to_redo` | 戻せる / やり直せる履歴がない | `nothing to undo` |

* `message` は LLM が読んで自分で直せるよう、英文で「何番目の何が違うか」を書く
* 型の違いなどは zod のメッセージに場所（`commands[0].title`）を付けて返す。未定義の Command・フィールド、必須項目の欠けは、使える Command・フィールドを添えた独自の英文にする
