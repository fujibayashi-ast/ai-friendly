# CLAUDE.md

## Project Overview

**AI Friendly Site** — AI が少ない手数で操作できるサイトのサンプル集。

* サイトの処理を Command にまとめ、UI・サイト内の AI チャット・WebMCP のすべてが同じ Command を通して操作する設計パターンを示す
* 主役は Command パターン。WebMCP（`document.modelContext`）が主流になるまでのつなぎであり、そのまま WebMCP にもつながる形にする
* 題材の異なる複数のサイト（`apps/`）で、共通の基盤（`packages/`）がそのまま使えることを見せる
* サーバーを持たない SPA として公開し、完成後に Zenn で紹介する（個人プロジェクト）

## Core Rules

* 1 Issue = 1 PR を守る
* Issue のスコープ外の変更をしない
* どんな小さなバグ・改善でも必ず Issue を経由する（履歴を残すため、直接実装・PR 作成しない）
* 実装前に方針を説明する
* 実装後に確認手順を記載する
* サーバーを置かない。API 呼び出しはダミー（通信しないモック）で表現する
* LLM はブラウザで動かす（ローカル LLM）。サーバー経由の呼び出しは追加しない

## Tech Stack

* 言語: TypeScript
* フレームワーク: React + Vite（SPA）
* UI: shadcn/ui + Tailwind v4（`packages/ui`）
* ストレージ: localStorage
* パッケージマネージャ: bun（bun workspaces によるモノレポ）
* lint / format: Biome
* テスト: `bun test`
* Command の引数の定義・検証: zod（v4）
* i18n: UI と AI チャットの両方を多言語対応する（実装方法は Issue で判断する）
* その他のライブラリは必要になった時点で Issue で判断して追加する

## Architecture

詳細は [docs/architecture.md](docs/architecture.md)。

```
apps/
  <題材>/       # Vite + React の SPA。Command の定義と画面だけを書く
    docs/       # 題材ごとの Command 一覧・仕様
packages/
  command/      # 純粋なロジック（React / LLM に依存しない）
                #   Command 定義の型・execute（バッチ・ロールバック）・Undo/Redo・検証・確認フック
                #   AI 向けツール（短い一覧・inputSchema）・WebMCP 登録（`@ai-friendly/command/webmcp`）
  assistant/    # サイト内の AI チャット
                #   チャット UI（React）・LLM プロバイダの切り替え（ローカル LLM / Claude API など）
  ui/           # 共通 UI（shadcn/ui + Tailwind v4 の配色トークン `theme.css`）
```

* 依存の向きは `apps → packages/assistant → packages/command`、`apps / assistant → packages/ui`。`command` と `ui` は他の package に依存しない
* `command` 単体でも成立させる（チャットを使わず WebMCP だけで操作される場合も、`command` だけで AI から操作できる）
* 題材は複数用意する <!-- 未記入: 題材は検討中 -->

## Domain Rules

* 状態の変更は必ず Command を通す。UI・AI チャット・WebMCP はすべて同じ Command を使う
* 複数の Command は 1 バッチとして実行する。1 つでも失敗したらバッチ全体を適用しない。Undo 1 回でバッチ全体を戻す
* 実行結果は `{ ok: true }` / `{ ok: false, code, message }` で返す。`message` は LLM が読んで自分で直せる英文にする（何番目の何が違うか）
* ID は Command を発行する側で決める（同じ Command 列なら同じ結果になるように）
* Command には発行元（`"user"` / `"ai"`）を持たせる
* 確認が必要な Command は定義に `requiresConfirmation` を持たせる。発行元が `"ai"` のときは、アプリが渡す確認フックで承認を得てから実行する
* AI 向けツールの説明は JSON Schema の全文ではなく、1 Command 1 行の短い一覧にする（小さいローカル LLM 向け）

## Coding Rules

* 分割は責務単位で行う（1 ファイル = 1 責務）
  * ファイル 300 行 / 関数 50 行程度を、責務が混ざっていないか見直すきっかけにする
* 命名
  * ファイル名は kebab-case（`chat-widget.tsx`）。コンポーネント名は PascalCase
  * Command 名は snake_case の動詞始まり（`add_item`）
* 共通処理の置き場
  * 題材に依存しない処理は `packages/` の責務に応じた package に置く
  * `utils/` のような何でも置き場は作らない
* 禁止事項
  * UI から状態を直接変更すること（Command を通す）
  * TS の `any`
  * UI 文字列の直書き（i18n を通す）
  * ユーザーの操作なしに動く外部通信の追加（通信する機能は Issue で判断する）
  * 不要なライブラリの追加（追加時は PR に理由を書く）
* テスト: `packages/` のロジックはユニットテスト必須。UI テストは重要なものに絞る

### コメント

* コードを読めばわかることは書かない。必要なら書いてよい
* `packages/` の公開 API（`index.ts` から export するもの）には JSDoc を書く
  * 1〜2 行で「何をするか」と型からわからない注意点を書く。`@example` は入口になる関数だけ
  * 詳しい仕様は docs に書き、`@see docs/...` で参照する（同じ内容を二重に書かない）
  * 内部の関数には書かない
* コメントの行末に「。」を付けない（行の途中で文を区切る「。」はよい）
* 長い説明・設計の背景は docs に置く
* 経緯・実装決定までの流れはコメントに書かず `docs/history/` に置く

## Guidelines

* シンプルに実装する
* 不要なライブラリを追加しない
* パフォーマンスを意識する

### モノレポでのコンテキスト節約

* コマンドは変更した package にスコープする（`bun test packages/command` / `bun run --filter @ai-friendly/command typecheck` / `bunx biome check packages/command`）
* package はビルドせず `src/index.ts` を `exports` で公開する（題材アプリの Vite がソースを直接取り込む）
* `node_modules/` / `dist/` / `bun.lock` は読み込まない

## Documentation Rules

* 新しい機能を実装する場合、対応するドキュメントを更新する
* 実装とドキュメントの内容を一致させる
* `docs/` 配下のドキュメントを追加・削除した場合は `docs/README.md` の索引も更新する
* 更新必須のドキュメント
  * `docs/architecture.md`: package 構成と依存の向き
  * `docs/commands.md`: 共通の Command 基盤の仕様
  * `apps/<題材>/docs/commands.md`: 題材ごとの Command 一覧
  * `docs/history/YYYY-MM-DD-<topic>.md`: 決めたこと・比べた案・採らなかった理由。Issue で設計判断をしたときに、その PR に含めて書く
* 図は Mermaid で書く

## Security / Operation

* 外部通信は原則なし。必要になったらその都度 Issue で判断する
  * 例外: ローカル LLM のモデルのダウンロード（ユーザーが選んだときのみ）
* API キーなどの機密情報は持たない。必要な場合は `.env` に置き、コミットしない
* 個人情報は扱わない。localStorage に保存するのはサンプルデータのみ
* AI が出した Command は発行元 `"ai"` として記録する

## MCP

`.mcp.json` で以下を利用する。

* `context7`: ライブラリの最新ドキュメント参照。WebMCP / WebLLM など変化の速い API は記憶に頼らずここで確認する
* `chrome-devtools`: 画面確認・コンソール・ネットワーク・`evaluate_script` による WebMCP ツールの呼び出し
* `playwright`: 複数ステップのブラウザ操作・E2E 的な動作確認

ブラウザでの確認は **WebMCP ツール > chrome-devtools > playwright** の順に優先する。

## Deploy

* Cloudflare Pages に SPA として公開する（設定は Issue で行う）
* GitHub Release / バージョニング / npm 公開は行わない

## Issue / PR Rules

* Issue 作成時は `/issue` スキルを使うこと
* PR 作成前に `/review` スキルでセルフレビューを行うこと
* PR 作成時は `/pr` スキルを使うこと

## Implementation Workflow

* Issue 着手から PR マージまでの流れは `docs/claude/workflow.md` に従うこと
* 利用可能なスキルは `.claude/skills/` 配下。description / when_to_use に従い、場面に応じて自動的に選ぶこと
* UI を作る・直すときはデザイン系スキル（`hallmark` / `frontend-design` / `baseline-ui` / `fixing-accessibility`）を、WebMCP・フォームなどは `modern-web-guidance` を使う

## Docs

* [docs/README.md](docs/README.md): ドキュメント索引
* [docs/architecture.md](docs/architecture.md): アーキテクチャ
* `docs/history/`: 設計判断の経緯
* `apps/<題材>/docs/`: 題材ごとの仕様
