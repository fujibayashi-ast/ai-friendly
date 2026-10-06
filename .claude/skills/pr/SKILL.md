---
name: pr
description: Pull Request を作成する。PR 作成時は必ずこの Skill を使うこと。
when_to_use: PR を作りたい、プルリクエストを出したい時
argument-hint: "[対応する Issue 番号]"
---

# PR 作成

## ルール

- 1 Issue = 1 PR を厳守する
- `.github/PULL_REQUEST_TEMPLATE.md` に必ず従う
- Issue のスコープ外の変更を含めない
- 確認手順は必ず記載する

## 手順

### 1. 対応 Issue を確認する

Issue 番号が不明な場合はユーザーに確認する。

### 2. 変更内容を把握する

```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
```

### 3. PR テンプレートを読み込む

`.github/PULL_REQUEST_TEMPLATE.md` を Read ツールで読み込み、各項目を把握する。

### 4. PR の内容を作成する

`.github/PULL_REQUEST_TEMPLATE.md` の各セクションに沿って埋める。

特記事項:

- **確認手順**: 必ず記載する（レビュアーが動作検証するため）
- **スクリーンショット**: ユーザーからスクショが提供された場合のみ記載。提供がなければセクションごと省略する（Claude 側でスクショを撮る手段はない前提）
- **スコープ外**: 対応しなかった項目があれば明示し、必要なら別 Issue に切り出す
- **stacked PR**（`docs/claude/workflow.md` の「サブ Issue と stacked PR」）: 本文の冒頭に stack の一覧（親 Issue・各 PR・この PR の位置）を書く。差分の確認（手順 2）の `main` は直前のブランチに読み替える

### 5. PR を作成する

```bash
gh pr create \
  --title "PRタイトル" \
  --body "テンプレートに沿った本文"
```

stacked PR の場合は `gh stack submit --auto` で作った PR を `gh pr edit` で書き直す（`gh stack` が使えないときは `gh pr create --base <直前のブランチ>`）。

### 6. 結果を報告する

作成した PR の URL を表示する。
