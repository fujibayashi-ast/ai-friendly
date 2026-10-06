# やることリスト（apps/tasks）

やることを追加・完了・削除する小さなサイト。普通のサイトとして作り、AI の層を後から足す。

## サイト

* やることの追加・完了のチェック・削除だけ（絞り込み・件数・「完了したものを削除」は置かない）
* 状態は React の state に持ち、保存しない（再読み込みで最初に戻る）。最初にサンプルのやることを 3 つ入れておく
* ID は `"1"`, `"2"` のような短い連番。削除した ID は使い直さない
* 画面からの削除では確認を出さない
* 文言は ja / en（右上で切り替え）。やることの名前はユーザーのデータなので訳さない

## 構成

```
src/
  main.tsx / app.tsx      # I18nProvider > TasksProvider > レイアウト + ページ
  tasks/                  # 普通のサイトの機能
    tasks.ts              #   型と、状態を変える純粋な関数（追加・完了・削除）
    tasks-provider.tsx    #   useState で持ち、関数を出す（useTasks）
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/home/             # 追加の入力欄・一覧・1 行（task-item.tsx）
```
