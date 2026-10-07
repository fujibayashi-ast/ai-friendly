# ドキュメント一覧

`docs/` 配下のドキュメント索引。新しいドキュメントを追加・削除したらこのファイルも更新する。

## プロジェクト固有（`docs/`）

- [architecture.md](architecture.md) — アーキテクチャ（package 構成と依存の向き）
- [commands.md](commands.md) — 共通の Command 基盤（`@ai-friendly/command`）の仕様
- [ui.md](ui.md) — 共通 UI（`@ai-friendly/ui`）の使い方・配色・部品の追加
- [ai-tools.md](ai-tools.md) — AI 向けツールと WebMCP への登録（`createAiTools`・`@ai-friendly/command/webmcp`）
- [assistant.md](assistant.md) — サイト内の AI チャット（`FloatingChat`・会話のループ・プロバイダ）
- `history/` — 設計判断の経緯（`YYYY-MM-DD-<topic>.md`）
  - [2026-10-05-initial-setup.md](history/2026-10-05-initial-setup.md) — 初期セットアップで決めたこと
  - [2026-10-05-monorepo-scaffold.md](history/2026-10-05-monorepo-scaffold.md) — monorepo の土台（ビルドしない package・npm 公開時の検討）
  - [2026-10-05-command-core.md](history/2026-10-05-command-core.md) — Command 基盤の設計（スナップショット方式の Undo・zod の引数・条件付きの確認）
  - [2026-10-05-ai-tools.md](history/2026-10-05-ai-tools.md) — AI 向けツールの置き場所と粒度
  - [2026-10-05-ui-package.md](history/2026-10-05-ui-package.md) — 共通 UI（shadcn・アクセントの黄・標準から変えたところ）
  - [2026-10-05-settings-app.md](history/2026-10-05-settings-app.md) — 最初の題材（テーマ・言語の切り替え・i18n・確認ダイアログ）
  - [2026-10-06-command-store.md](history/2026-10-06-command-store.md) — アプリの状態にセッションをつなぐ（`store`）
  - [2026-10-06-remove-undo.md](history/2026-10-06-remove-undo.md) — Command 基盤から Undo / Redo と操作の履歴を外した理由
  - [2026-10-06-minimal-command.md](history/2026-10-06-minimal-command.md) — Command をサイトの関数を呼ぶ形にし、バッチ・状態を外した理由
  - [2026-10-06-chat-ui.md](history/2026-10-06-chat-ui.md) — チャット UI（置き場所・ツールの表示・仮のボット・デザイン）
  - [2026-10-06-claude-provider.md](history/2026-10-06-claude-provider.md) — Claude API のプロバイダ（ブラウザから直接呼ぶ・仮のボットを外す・#10 の見送り）
  - [2026-10-06-local-llm.md](history/2026-10-06-local-llm.md) — LLM の切り替えと Gemini Nano・WebLLM（Prompt API と WebLLM の比較・ツールの呼び出しを JSON Schema で受ける）
  - [2026-10-06-home.md](history/2026-10-06-home.md) — トップページと、1 つのサイトとして開発・公開する形
  - [2026-10-06-tasks-app.md](history/2026-10-06-tasks-app.md) — やることリスト（stacked PR・ID を探して操作する Command・AI からだけの削除の確認）
  - [2026-10-06-confirmation-text.md](history/2026-10-06-confirmation-text.md) — 確認の文言を Command の定義に持たせる（`confirmation`）
  - [2026-10-06-shop-app.md](history/2026-10-06-shop-app.md) — ネットショップ（表示を変える Command・在庫の状態による失敗・非同期の注文）
  - [2026-10-06-reservation-app.md](history/2026-10-06-reservation-app.md) — 予約フォーム（フォームを埋める Command・入力のエラーを直す・小さいモデルの対話の限界）
  - [2026-10-07-run-success-message.md](history/2026-10-07-run-success-message.md) — 成功したときにも AI 向けの英文を返す（`{ ok: true, message }`）
  - [2026-10-07-guards-in-site.md](history/2026-10-07-guards-in-site.md) — 守りをサイトの関数に置き、結果を多めに返す（画面と AI で同じ挙動）
  - [2026-10-07-admin-app.md](history/2026-10-07-admin-app.md) — 管理画面（React Router・ページ遷移の Command・見えている行だけの get_state・数値の ID）

題材ごとの仕様は `apps/<題材>/docs/` に置く。

- [apps/settings/docs/commands.md](../apps/settings/docs/commands.md) — テーマ・言語の切り替えサイトの Command
- [apps/tasks/docs/commands.md](../apps/tasks/docs/commands.md) — やることリストのサイトと Command
- [apps/shop/docs/commands.md](../apps/shop/docs/commands.md) — ネットショップのサイトと Command
- [apps/reservation/docs/commands.md](../apps/reservation/docs/commands.md) — 予約フォームのサイトと Command
- [apps/admin/docs/commands.md](../apps/admin/docs/commands.md) — 管理画面のサイトと Command

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
