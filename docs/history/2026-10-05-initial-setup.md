# 2026-10-05 初期セットアップ

`/setup` のヒアリングで決めたこと。

## 先行事例の調査

* WebMCP そのもののデモ（Chrome Labs のピザ注文・旅行検索、WebMCP-org/examples など）はすでに多い
* 「Command で処理をまとめ、AI が少ない手数で操作できるようにする」設計パターンを示すサンプルはあまり見当たらない
* このため、主役を Command パターンにした。WebMCP は主流になるまでの間のつなぎ先として位置づける
* WebMCP の API は 2026-05-27 の草案で `navigator.modelContext` から `document.modelContext` に移った（Chromium 150 で旧名は deprecated）

## モノレポにした理由

* 題材の異なる複数のサイトで共通の Command 基盤を使うことで、パターンが題材に依存しないことを見せられる
* ツール（Turborepo など）は入れず、bun workspaces だけで組む

## `command` と `assistant` を分けた理由

* チャット UI は Command とセットで使うことが多いが、WebMCP だけで操作される場合はチャットが要らない
* `command` を React / LLM に依存しない純ロジックにすると、ユニットテストが書きやすい
* AI 側（ツール生成・WebMCP・LLM・チャット UI）はいつも一緒に使うため、`assistant` 1 つにまとめた

## サーバーを置かない理由

* 見せたいのはフロントエンドの処理であり、API はダミーで足りる
* 「サーバーを使っていない」ことを示すため、SSR ではなく SPA にした
* LLM の呼び出し場所もブラウザ（ローカル LLM）に統一した

## 参考にしたリポジトリ

* `fujibayashi-ast/daw-tool`: Command API（バッチ・逆操作による Undo・発行元）、小さい LLM 向けのツール説明（短い一覧・英文のエラー）
* `fujibayashi-ast/loop-study`: WebMCP ツールとチャットウィジェットの構成
