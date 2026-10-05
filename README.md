# AI Friendly Site

AI が少ない手数で操作できるサイトのサンプル集。

サイトの処理を **Command** にまとめ、画面の操作・サイト内の AI チャット・WebMCP（ブラウザの AI エージェント）のすべてが同じ Command を通して操作する設計パターンを示す。題材の異なる複数のサイトで、共通の基盤がそのまま使えることを見せる。

- サーバーなしの SPA（API はダミー）
- LLM はブラウザ上のローカル LLM
- WebMCP（`document.modelContext`）が主流になるまでのつなぎであり、そのまま WebMCP にもつながる構成

## 構成

```
apps/<題材>/         # 各サンプルサイト（Vite + React）
packages/command/    # Command の定義・実行・Undo・検証（React / LLM に依存しない）
packages/assistant/  # AI 向けツール生成・WebMCP 登録・ローカル LLM・チャット UI
```

詳細は [docs/architecture.md](docs/architecture.md)。

## Getting Started

> 実装前のため、以下は予定のコマンド。

```sh
bun install
bun --filter <題材> dev
```

### チェック

```sh
bunx biome check
bun run typecheck
bun test
bun run build
```

## 技術スタック

TypeScript / React / Vite / bun（workspaces）/ Biome / localStorage

## ドキュメント

- [docs/README.md](docs/README.md) — ドキュメント索引
- [docs/claude/guide.md](docs/claude/guide.md) — Claude Code を使った開発の進め方
