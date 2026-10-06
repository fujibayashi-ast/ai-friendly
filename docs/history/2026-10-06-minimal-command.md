# 2026-10-06 Command をサイトの関数を呼ぶ形にし、基盤を最小限にする

#23 で決めたこと。仕様は [docs/commands.md](../commands.md)・[docs/ai-tools.md](../ai-tools.md)。

## 何が変わったか

| | これまで | これから |
| --- | --- | --- |
| Command の中身 | `apply(state, args)` で新しい状態を計算して返す | `run(args)` でサイトの関数（`setLanguage` など）を呼ぶ |
| 状態 | セッションが持つ（`initialState`）か、`store` で読み書きする | サイトが持つ。基盤は状態を知らない |
| 実行の入口 | `createCommandSession` の `execute` / `executeRaw` | `createAiTools` のツールの `execute` |
| まとめて実行 | `execute_commands`（バッチ・全部か何もしないか） | なし。Command ごとのツールを 1 つずつ呼ぶ |
| 発行元 | `"user"` / `"ai"` | なし（実行するのは AI だけ） |
| 確認の条件 | `(state, args) => boolean` | `(args) => boolean`。状態は Command を作るときに閉じ込める |

## なぜ変えたか

* 最初の題材（PR #18）のレビューで、「普通のサイトに AI の層を **足す** だけ」にしたいという方針になった
* #19 で `store` を足し、サイトの状態をセッションから読み書きできるようにしたが、Command の `apply` とサイトの setter に「language を変える」処理が 2 か所に書かれていた。レビューで「Command は `setLanguage` を使うイメージだった」「新しい状態になったら Command を作り直せばよい」となった
* バッチは「小さいローカル LLM で手数を減らす」ための工夫の 1 つで、サンプルとしては凝りすぎだった。Undo（#21）と同じく、なくても仕組みは成り立つ

## 失ったもの

* **全部か何もしないか**: `run` がサイトの関数をその場で呼ぶので、途中で失敗しても前の操作は戻せない。Command を 1 つずつ実行するので、そもそも「途中」がなくなった
* **ローカル LLM の手数**: 「英語にしてダークにして」は 2 回のツール呼び出しになる。[2026-10-05-ai-tools.md](2026-10-05-ai-tools.md) で「チャットには `execute_commands` と `get_state` だけを渡す」としていた想定は、チャット（#11）で見直す。短い一覧（`describeCommands`）はシステムプロンプト向けに残した

## 残したもの

* 引数の検証と、LLM が読んで直せる英文のエラー
* 確認フック（`requiresConfirmation`）
* AI 向けツール（Command ごと・`get_state`）と WebMCP 登録

## 採らなかった案

* **`store` のまま、Command の中で setter を呼ばない**: バッチの保証は保てるが、サイトの処理と Command の処理が二重になり、「普通のサイトに足す」が伝わりにくい
* **バッチを「順に実行して、失敗したら止める」形で残す**: 実行する側から見ると 1 つずつ呼ぶのとほぼ同じで、基盤に置く理由が薄い。要るサイトは外側に足せる
