# AI Friendly Site

AI が操作しやすいサイトのサンプル集。

普通のサイトに、サイトの関数を **Command** として包む層を足すだけで、サイト内の AI チャット・WebMCP（ブラウザの AI エージェント）から操作できるようにする設計パターンを示す。題材の異なる複数のサイトで、共通の基盤がそのまま使えることを見せる。

- サーバーなしの SPA（API はダミー）
- AI チャットの LLM は、利用者の API キーで Claude API をブラウザから直接呼ぶか、ブラウザの中の LLM（Chrome の Gemini Nano・WebLLM の Qwen）を使う（入力欄で切り替える）
- WebMCP（`document.modelContext`）が主流になるまでのつなぎであり、そのまま WebMCP にもつながる構成

## 構成

```
apps/home/           # トップページ（サンプルのカード）
apps/settings/       # 題材 1: テーマ・言語の切り替え（Vite + React）
packages/command/    # Command の定義・検証・確認・AI 向けツール・WebMCP 登録（React / LLM に依存しない）
packages/assistant/  # サイト内の AI チャット（チャット UI・LLM の切り替え）
packages/ui/         # 共通 UI（shadcn/ui + Tailwind v4）
```

詳細は [docs/architecture.md](docs/architecture.md)。

## Getting Started

```sh
bun install
bun run dev   # トップと各サンプルをまとめて起動
```

`http://localhost:5173/` を開くと、トップページにサンプルが並ぶ。カードから各サンプル（`/settings/` など）を開く。

* テーマと言語を右上のボタンで切り替えられる
* 右下のボタンからチャットを開き、Claude の API キーを入れるか、入力欄の左下で Gemini Nano（パソコン版の Chrome 148 以降）か Qwen3.5 4B（WebGPU が使えるブラウザ）に切り替えると、話しかけて操作できる
* 開発中は devtools のコンソールで `window.__aiTools` から同じツールを呼べる（[apps/settings/docs/commands.md](apps/settings/docs/commands.md)）

### チェック

```sh
bun run check      # Biome（lint / format）
bun run format     # Biome の自動修正
bun run typecheck  # 全 workspace の型チェック
bun test
bun run build      # 各アプリをビルドし、公開用に dist/ にまとめる（/ がトップ、/settings/ など）
```

## 技術スタック

TypeScript / React / Vite / shadcn/ui / Tailwind v4 / zod / bun（workspaces）/ Biome / localStorage

## ドキュメント

- [docs/README.md](docs/README.md) — ドキュメント索引
- [docs/claude/guide.md](docs/claude/guide.md) — Claude Code を使った開発の進め方
