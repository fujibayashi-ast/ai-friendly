# ドキュメント一覧

`docs/` 配下のドキュメント索引。新しいドキュメントを追加・削除したらこのファイルも更新する。

## プロジェクト固有（`docs/`）

- [architecture.md](architecture.md) — アーキテクチャ（package 構成と依存の向き）
- [commands.md](commands.md) — 共通の Command 基盤（`@ai-friendly/command`）の仕様
- [ui.md](ui.md) — 共通 UI（`@ai-friendly/ui`）の使い方・配色・部品の追加
- [ai-tools.md](ai-tools.md) — AI 向けツールと WebMCP への登録（`createAiTools`・`@ai-friendly/command/webmcp`）
- `history/` — 設計判断の経緯（`YYYY-MM-DD-<topic>.md`）
  - [2026-10-05-initial-setup.md](history/2026-10-05-initial-setup.md) — 初期セットアップで決めたこと
  - [2026-10-05-monorepo-scaffold.md](history/2026-10-05-monorepo-scaffold.md) — monorepo の土台（ビルドしない package・npm 公開時の検討）
  - [2026-10-05-command-core.md](history/2026-10-05-command-core.md) — Command 基盤の設計（スナップショット方式の Undo・zod の引数・条件付きの確認）
  - [2026-10-05-ai-tools.md](history/2026-10-05-ai-tools.md) — AI 向けツールの置き場所と粒度
  - [2026-10-05-ui-package.md](history/2026-10-05-ui-package.md) — 共通 UI（shadcn・アクセントの黄・標準から変えたところ）
  - [2026-10-06-command-store.md](history/2026-10-06-command-store.md) — アプリの状態にセッションをつなぐ（`store`）
  - [2026-10-06-remove-undo.md](history/2026-10-06-remove-undo.md) — Command 基盤から Undo / Redo と操作の履歴を外した理由

題材ごとの仕様は `apps/<題材>/docs/` に置く。

## Claude / 運用向け（`docs/claude/`）

- [guide.md](claude/guide.md) — 開発ガイド（人間向け）
- [skills.md](claude/skills.md) — skill の運用方針・取得元（テンプレートリポジトリ）設定
- [workflow.md](claude/workflow.md) — Issue 着手から PR マージまでの標準ワークフロー

## 命名・配置ルール

- プロジェクト固有のドキュメントは `docs/` 直下
- Claude / 運用向けメタドキュメントは `docs/claude/`
- 設計判断の経緯は `docs/history/YYYY-MM-DD-<topic>.md`
- 題材ごとの仕様は `apps/<題材>/docs/`
- 図は Mermaid で書く
- 新規ドキュメント追加・削除時は本ファイルに反映する
