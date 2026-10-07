# 共通 UI（`@ai-friendly/ui`）

shadcn/ui のコンポーネントと Tailwind v4 の配色トークン。各アプリとチャット UI（`assistant`）が使う。

## 使い方

アプリの CSS:

```css
@import "tailwindcss";
@import "@ai-friendly/ui/theme.css";
@source "../../../packages/ui/src"; /* ui のクラスを Tailwind に拾わせる（アプリからの相対パス） */
```

```tsx
import { Button, ToggleGroup, ToggleGroupItem } from "@ai-friendly/ui";
```

## 部品

| 部品 | 用途 |
| --- | --- |
| `Button` | ボタン（`variant`: default / destructive / outline / secondary / ghost / link） |
| `ToggleGroup` / `ToggleGroupItem` / `Toggle` | テーマ・言語などの選択 |
| `Input` | 1 行の入力欄（API キーの入力など） |
| `Select` | 選択肢から 1 つ選ぶ（チャットの LLM の切り替えなど） |
| `Textarea` | 複数行の入力欄（チャットの入力など） |
| `AlertDialog` 一式 | AI が `requiresConfirmation` の Command を実行するときの確認 |
| `cn` | クラス名の結合（clsx + tailwind-merge） |

* 使う予定のない部品は入れない。必要になったら shadcn の CLI で追加する（下の「部品の追加」）

## 配色

* 白黒（shadcn の neutral）に、アクセントとして蛍光マーカーの黄（`--primary`）を 1 色だけ差す
* 黄は地の色としてだけ使い、上の文字は黒（`--primary-foreground`）にする。白地の文字色には使わない（コントラストが足りない）
* フォーカスリング（`--ring`）は、ライトでは暗い黄土色（白地で 4.9:1）、ダークでは黄
* 選択中のトグルは黄の地に加えて文字色の枠線を付ける（黄と白地の差は 1.4:1 しかなく、色だけでは選択中がわからないため）
* `--accent` は hover などの背景に使われるため灰色のまま

## ダークモード

`<html>` などの祖先要素に `.dark` クラスを付けると切り替わる（`@custom-variant dark`）。

## 部品の追加

```sh
cd packages/ui
bunx shadcn@latest add <component>
```

* 追加後、`@/` で始まる import を相対パスに書き換える（アプリ側では `@/` を解決できないため）
* `package.json` に意図しない依存が足されていないか確認する（CLI が `utils` の別名を読み違え、無関係の `cn` パッケージを足したことがある）
* `focus-visible:ring-ring/50` は `focus-visible:ring-ring` にする（半透明だとフォーカスが見えにくい）
* `src/index.ts` から export する

### 手を入れた部品

CLI で入れ直すと上書きされるので、入れ直したら同じ手を入れる。

* `toggle-group`: 枠線つき（`variant="outline"`）・すき間なし（`spacing` 0）の項目は、左の線を消す（`border-l-0`）代わりに 1px 重ね（`-ml-px`）、選んだ項目を上に出す（`data-[state=on]:z-10`）。左の線を消すと、2 つ目以降を選んだときに濃い線が欠ける（#95）
