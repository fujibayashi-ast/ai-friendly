# 2026-10-07 Qwen（WebLLM）で、数字の ID を文字列で書かせると JSON が壊れる

#93 で調べたこと。引数の型の決め方は [docs/commands.md](../commands.md) の「引数の書き方」。

## きっかけ

* 管理画面（#89）を Qwen3.5 4B で試すと、「注文 1029 の中身を教えて」で毎回「返事を受け取れませんでした」になった
* 出力は `{"calls": [{"name": "show_order", "input": {"order_id":   "}]}` で止まっていた（`finish_reason: "stop"`・21 トークン）。返事の形は JSON Schema で縛っているので、本来は起きないはず
* `use-chat.ts` は例外をどこにも出さずに「返事を受け取れませんでした」にしていたので、原因が見えなかった

## 調べたこと

アプリのコードを通さない最小の再現（WebLLM だけ・`temperature: 0`・`Qwen3.5-4B-q4f16_1-MLC`・WebLLM 0.2.85＝最新）で、同じことが起きた。

| 引数の型 | 頼み方 | 出力 | finish_reason |
| --- | --- | --- | --- |
| string | `Show me the items in order 1029.` | `{"order_id": ` の後、空白だけを書き続ける（4079 文字・4051 トークン） | `length` |
| integer | 同じ | `{"order_id": 1029}` | `stop` |
| string | `...order with id "1029".` | `{"order_id": "1029"}` | `stop` |
| string | `注文 1029 の中身を教えて` | `{"order_id": "}`（文字列の途中で終わる） | `stop` |

* きっかけは、AI が文脈で見ている ID の形（数値の `1029`）と、引数の型（string）の食い違い。数字をそのまま書こうとして、縛りに `"` を書かされたところで崩れる
* 文字列の途中で終わる・空白を上限まで書くのは、縛り（XGrammar）が防ぐべきことなので、WebLLM の不具合として報告した: [mlc-ai/web-llm#868](https://github.com/mlc-ai/web-llm/issues/868)（似た報告: [#807](https://github.com/mlc-ai/web-llm/issues/807)。Qwen3 で XGrammar が落ちる）
* ネットショップ（`get_state` に `"id": "6"`、引数も string）は、`product_id` を 7 回書かせて一度も壊れなかった。見えている形と型がそろっていれば起きない

## 決めたこと

* 引数の型は、AI が見ている値の形とそろえる。数字だけの ID は数値にする（管理画面は #91 で注文番号・商品 ID を数値にした）
* ネットショップは変えない（文字列のまま見えていて、型もそろっている）
* 返事を読めなかったときは、例外をコンソールに出す
* WebLLM の側で直ったら、この注意は外せる
