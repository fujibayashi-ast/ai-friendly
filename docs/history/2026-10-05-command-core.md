# 2026-10-05 Command 基盤の設計

#7 で決めたこと。仕様は [docs/commands.md](../commands.md)。

## Undo をスナップショット方式にした理由

* 「Command が逆操作を返す」方式（daw-tool）と「実行前の状態を履歴に積む」方式を比べ、後者にした
* daw-tool はノート・音声クリップなど状態が大きく、スナップショットではメモリを使いすぎるため逆操作にした。このプロジェクトの題材は localStorage に収まる小さな状態で、その心配がない
* 状態を不変にすれば、実行前の参照を持つだけでよい
* 題材の作者が逆操作を書かずに済み、「Command を定義するだけ」に近づく
* 何をしたかの記録は、履歴に Command 列と発行元を残して代わりにする

## 引数を JSON Schema のサブセットで書く理由

* 検証（このパッケージ）・WebMCP の `inputSchema`・AI 向けの短い一覧（`assistant`）の 3 つで同じ定義を使える
* zod などを入れると、WebMCP 用に JSON Schema へ変換する手間とライブラリが増える
* 扱う型は題材に必要な範囲（string / number / integer / boolean / enum / array / object）に絞った。足りなくなったら Issue で足す

## `execute` を非同期にした理由

* 確認フック（ダイアログで承認を待つ）が非同期のため
* 発行元が user で確認が要らないときも、戻り値の形を揃えた

## `execute` と `executeRaw` を分けた理由

* 画面のコードは定義済みの Command だけを型で受け取れる方が書きやすい（`type` の打ち間違いがコンパイル時にわかる）
* LLM の JSON は型が分からないため、`unknown` を受け取る入口を別に用意した。どちらも同じ検証を通る

## `apply` のエラーに code を持たせなかった理由

* 題材ごとの code を増やしても、受け取る側（LLM・画面）は `message` を読めば足りる
* 呼び出し側は `domain_error` 1 つで分岐できる
