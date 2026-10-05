# ドキュメント一覧

`docs/` 配下のドキュメント索引。新しいドキュメントを追加・削除したらこのファイルも更新する。

## プロジェクト固有（`docs/`）

- [architecture.md](architecture.md) — アーキテクチャ（package 構成と依存の向き）
- `commands.md` — 共通の Command 基盤の仕様（`packages/command` 実装時に作成）
- `history/` — 設計判断の経緯（`YYYY-MM-DD-<topic>.md`）
  - [2026-10-05-initial-setup.md](history/2026-10-05-initial-setup.md) — 初期セットアップで決めたこと

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
