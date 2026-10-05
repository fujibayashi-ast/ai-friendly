# 2026-10-05 monorepo の土台

#4 で決めたこと。

## package をビルドしない理由

* package を使うのは同じ repo の題材アプリ（Vite）だけで、Vite は TS のソースをそのまま取り込める
* `exports` で `src/index.ts` を直接指せば、ビルド手順と `dist/` の管理が要らない

## ルートの scripts を `--workspaces --if-present` にした理由

* `--filter './apps/*'` は、一致する workspace がないとエラーになる（apps がない今の状態で CI が落ちる）
* `--workspaces --if-present` なら、そのスクリプトを持つ workspace だけで実行し、なければ何もせず成功する

## TypeScript 7 を使う

* ネイティブ版（7.0.2）で `tsc --noEmit` が型エラーを検出することを確認した
* 問題が出たら 6.x に下げる

## npm に公開する場合（今は公開しない）

公開を決めたら Issue で判断する。そのときに要る工夫:

* ビルドを足して `dist/`（JS と `.d.ts`）を出し、`exports` を書き換える
* `assistant` は `command` を `peerDependencies` で受け取る（アプリに 2 つの `command` が入り、型・状態が食い違うのを防ぐ）
* 2 つの package のバージョンを揃える（changesets か手動）。`workspace:*` は `bun publish` が実際のバージョンに書き換える
* 代わりに 1 つの package（`ai-friendly/command`・`ai-friendly/assistant` のサブパス）にまとめて公開すれば、バージョン管理の手間はなくなる
