# やることリスト（apps/tasks）

やることを追加・完了・削除する小さなサイト。普通のサイトとして作り、AI の層を後から足す。

## サイト

* やることの追加・完了のチェック・削除だけ（絞り込み・件数・「完了したものを削除」は置かない）
* 状態は React の state に持ち、保存しない（再読み込みで最初に戻る）。最初にサンプルのやることを 3 つ入れておく
* ID は `"1"`, `"2"` のような短い連番。削除した ID は使い直さない
* 画面からの削除では確認を出さない
* 文言は ja / en（右上で切り替え）。やることの名前はユーザーのデータなので訳さない

## 構成

```
src/
  main.tsx / app.tsx      # I18nProvider > TasksProvider > ConfirmProvider > レイアウト + ページ、<Ai />
  tasks/                  # 普通のサイトの機能
    tasks.ts              #   型と、状態を変える純粋な関数（追加・完了・削除）
    tasks-provider.tsx    #   useState で持ち、関数を出す（useTasks）
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/home/             # 追加の入力欄・一覧・1 行（task-item.tsx）
  commands/               # 足した層: やることの Command（useTasks の関数を呼ぶ）
  confirm/                # 足した層: 確認ダイアログ（useConfirm）
  ai/ai.tsx               # 足した層: <Ai />。AI 向けツール・WebMCP・右下のチャット
```

* `app.tsx` から `<Ai />` を外しても、サイトはそのまま動く

## Command

| Command | 引数 | 内容 | AI が実行するとき |
| --- | --- | --- | --- |
| `add_task` | `title: string`（空は不可） | やることを追加する | そのまま実行 |
| `set_task_done` | `id: string`・`done: boolean` | 完了・未完了にする | そのまま実行 |
| `delete_task` | `id: string` | やることを削除する | 確認ダイアログ（「『〇〇』を削除します。」） |
| `clear_completed` | なし | 完了したものをまとめて削除する。画面にボタンはなく、AI からだけ実行する | 確認ダイアログ（「完了した 〇 件を削除します。」）。完了したものがなければ確認せずに失敗を返す |

* `get_state` は `{ tasks: [{ id, title, done }] }` を返す。AI はここで名前から ID を探してから操作する
* 存在しない ID は `domain_error`: `set_task_done: task "9" not found (ids: 1, 2, 3)`（今ある ID を添えて、AI が自分で直せるように）
* `clear_completed` はサイトにない機能を、サイトの関数（`deleteTask`）の組み合わせで AI に足したもの。完了したものの数だけ `deleteTask` を呼ぶ
* 使い分け: 「牛乳と掃除を消して」のような個別の頼みは、AI が `delete_task` を件数分呼ぶ（確認も件数分）。「完了したものを消して」は `clear_completed` 1 回で済み、確認も 1 回にまとまる
* 削除の確認は AI からだけ。画面からの削除は確認しない（`requiresConfirmation` は Command の定義に持つので、人の操作には関係しない）
* `clear_completed` の確認は条件付き（`requiresConfirmation: () => 完了したものがある`）
* 状態が変わるたびに Command と AI 向けツールを作り直す（`get_state` と ID の確認が今のやることを使うように）

## AI から操作する

settings サイトと同じ。右下のボタンからチャットを開き、Claude / Gemini Nano / Qwen3.5 4B を選んで話しかける。

* システムプロンプト: やることリストを操作する・変える前に `get_state` で ID を探す・やることリストと関係のない頼みは短く断る・ユーザーの言語で短く返事する
* 話しかけ方の例: 「洗濯する、を追加して」「部屋の掃除を完了にして」「完了したものを消して」
* 開発中（`bun run dev`）は、devtools のコンソールで `window.__aiTools` から同じツールを呼べる

