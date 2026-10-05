# AI Friendly Site

AI が少ない手数で操作できるサイトのサンプル集。

サイトの処理を **Command** にまとめ、画面の操作・サイト内の AI チャット・WebMCP（ブラウザの AI エージェント）のすべてが同じ Command を通して操作する設計パターンを示す。題材の異なる複数のサイトで、共通の基盤がそのまま使えることを見せる。

- サーバーなしの SPA（API はダミー）
- LLM はブラウザ上のローカル LLM
- WebMCP（`document.modelContext`）が主流になるまでのつなぎであり、そのまま WebMCP にもつながる構成

## 構成

```
apps/<題材>/         # 各サンプルサイト（Vite + React）
packages/command/    # Command の定義・実行・Undo・検証・AI 向けツール・WebMCP 登録（React / LLM に依存しない）
packages/assistant/  # サイト内の AI チャット（チャット UI・LLM の切り替え）
```

詳細は [docs/architecture.md](docs/architecture.md)。

## Getting Started

```sh
bun install
```

> 題材アプリは準備中。追加後は `bun run --filter <題材> dev` で起動する。

### チェック

```sh
bun run check      # Biome（lint / format）
bun run format     # Biome の自動修正
bun run typecheck  # 全 workspace の型チェック
bun test
bun run build
```

## 技術スタック

TypeScript / React / Vite / bun（workspaces）/ Biome / localStorage

## ドキュメント

- [docs/README.md](docs/README.md) — ドキュメント索引
- [docs/claude/guide.md](docs/claude/guide.md) — Claude Code を使った開発の進め方
