# 開発ワークフロー

Issue 着手から PR マージまでの標準的な流れを定義する。

## サブ Issue と stacked PR

1 PR に収まらない Issue や、差分を分けて見せたい Issue（例: サイト構築 → UI 作成 → Command 繋ぎこみ）に使う。1 PR に収まる Issue には使わない。

### サブ Issue

* 親 Issue の下に、実装の単位でサブ Issue を作る（`/issue` スキル）。GitHub の Sub-issues で親に紐付ける

  ```bash
  gh api -X POST repos/{owner}/{repo}/issues/{親の番号}/sub_issues -F sub_issue_id={サブ Issue の id}
  # id は番号ではない: gh api repos/{owner}/{repo}/issues/{番号} --jq .id
  ```

* サブ Issue ごとにプランを作り（`/plan`）、1 サブ Issue = 1 PR を守る
* 親 Issue はコードを持たない。全サブ Issue の PR がマージされたら閉じる

### stacked PR

サブ Issue 同士に依存がある（上の変更が下の変更を前提にする）ときは、`gh-stack` スキル（`gh stack`）で積む。依存がなければ、それぞれ `main` から切ってよい。

* 下から順にブランチを積み、PR を出す（`gh stack init` → `gh stack add` → `gh stack submit --auto`）。PR のタイトル・本文は `/pr` スキルのとおりに `gh pr edit` で書き直す
* PR の本文の冒頭に、stack の一覧（親 Issue・各 PR・この PR の位置）を書く
* レビューは下から。下の PR を直したら `gh stack rebase --upstack` で上に反映する
* マージは下から順に（squash）。下がマージされたら `gh stack sync` で上を載せ直し、上の PR の base を `main` にする
* `gh stack` が使えない（リポジトリで Stacked PRs が使えない・終了コード 9）ときは、`git` だけで進める
  * ブランチ: 1 つ目は `main` から、2 つ目以降は直前のサブ Issue のブランチから切る。PR の base は直前のブランチ
  * 下の PR がマージされたら、上のブランチを載せ替えて push し、PR の base を `main` にする

    ```bash
    git fetch origin
    git rebase --onto origin/main <下のブランチの旧 HEAD> <上のブランチ>
    git push --force-with-lease
    gh pr edit <上の PR> --base main
    ```

## 1. Issue 着手

* 対象 Issue の内容を確認する
* 関連する docs（要件・UI 仕様・アーキテクチャ・DB スキーマなど）を確認する
* 不明点があれば着手前にコメントで確認する

## 2. プラン作成

* `/plan` スキルを使ってプランを作成する
* プランは対象 Issue のコメントとして投稿する
* Issue のスコープを超える内容は含めない

## 3. 実装

* プランに従って実装する
* プランから乖離しそうな場合は、実装を止めて Issue コメントでプランを更新する
* Issue のスコープ外の変更を混ぜない（気になる点は別 Issue として切り出す）

## 4. ドキュメント更新

* 新機能・仕様変更があった場合、該当する docs を更新する
* 実装とドキュメントの内容を一致させる
* プロジェクト固有のドキュメントルール（シーケンス図・ER 図など）は CLAUDE.md を参照

## 5. セルフレビュー

* `/review` スキルを使って PR 作成前にセルフレビューを行う
* 指摘があれば修正してから次に進む

## 6. PR 作成

* `/pr` スキルを使って PR を作成する
* `.github/PULL_REQUEST_TEMPLATE.md` の各セクションを埋める
* 確認手順を必ず記載する

## 7. レビュー対応

* `/fix` スキルでレビューコメントを整理し、順に対応する
* 対応しない指摘はその理由をコメントで返す
* 修正後に再度 `/review` を回してから push する
