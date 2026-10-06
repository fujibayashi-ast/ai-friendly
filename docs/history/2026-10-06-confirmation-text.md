# 2026-10-06 確認の文言を Command の定義に持たせる

#58 で決めたこと。仕様は [docs/commands.md](../commands.md) の「確認の文言」。

## きっかけ

* やることリスト（PR #56）では、確認ダイアログの文言を `<Ai />` の確認フックで `command.type` を見て分けていた（`delete_task` か、それ以外は `clear_completed`）
* 確認が要る Command が増えると分岐が長くなり、足し忘れると別の Command の文言が出てしまう

## 決めたこと

* Command の定義に `confirmation: (args) => { title, description, confirmLabel }` を足し、確認フックは `(command, confirmation)` で受け取る
  * 文言が Command の隣にあるので、Command を足すときに定義だけ書けば済む
  * チャット欄の中で確認ボタンを出すときも、同じ文言をそのまま使える
* 返すのは訳した文字列。package は i18n を知らず、アプリが Command を作るときに `t` を渡す。言語が変わると Command が作り直され、文言も変わる
* `confirmation` は省略できる。`window.confirm` で済ませる使い方や、文言の要らない場面のため。アプリでは、文言のない確認はダイアログを出さずに拒否する
* 確認するかは今までどおり `requiresConfirmation` で決め、`confirmation` があるだけでは確認しない（条件と見せ方を分ける）

## 比べた案

| 案 | 採らなかった理由 |
| --- | --- |
| アプリの `ai.tsx` で、Command の種類ごとの一覧（`Record<type, (command) => 文言>`）にする | 分岐はなくなるが、文言が Command と離れたまま。チャット内の確認など、ほかの場所で使うときにまた同じ一覧が要る |
| 定義に i18n のキーを持たせ、確認ダイアログで訳す | package がアプリの辞書の型を知ることになる。文字列なら package は何も知らなくてよい |
| `confirmation` があれば確認する（`requiresConfirmation` をなくす） | 「確認するか」と「何と見せるか」が混ざる。条件付きの確認（`clear_completed` など）が書きにくい |

## 文字列にして変わったこと

* これまでは辞書のキーを渡していたので、確認ダイアログを開いたまま言語を変えると文言も変わった。文字列にすると開いた時点の言語のまま。確認ダイアログは画面を覆うので、開いたまま言語を変えることはできず、困らない
