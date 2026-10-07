# 日記（apps/diary）

おまけ（遊び・実験）のサンプル。小さな日記のサイトで、AI の操作を仮のマウスカーソルの動きと打ち込みで見せる。サイトは普通に作り、AI の層とカーソルの演出を後から足す。

## サイト

* 一覧: 新しい順に、タイトル・本文の冒頭（2 行まで）。ダミーで 5 件。右上の「書く」で書くページへ
* 書く: タイトル・本文・「保存」。保存すると一覧に戻り、先頭に出る
* タイトル・本文が空なら保存せず、その項目の下に理由を出す（「タイトルを入れてください。」）
* 書きかけは、一覧に戻っても残る（保存すると空になる）。データは保存しない（再読み込みで最初に戻る）
* 文言は ja / en
* 日付・天気の項目は持たない。AI が書く中身はタイトルと本文だけにし、カーソルの動きを見せることに絞る（項目が多いと、小さいモデルが聞き返さずに天気を決める・日付を間違えるなど、本題と関係のないところで迷う）

## 構成

```
src/
  main.tsx                # BrowserRouter（basename: /diary/）
  app.tsx                 # I18nProvider > DiaryProvider > ルート（Layout の中に各ページ）
  diary/                  # 普通のサイトの機能
    diary.ts              #   日記・書きかけの型・並び順・保存できない理由（missingFields）
    entries.ts            #   ダミーの日記
    diary-provider.tsx    #   日記と書きかけを持ち、関数を出す（useDiary: setDraftField / save）
    use-save-entry.ts     #   「保存」して一覧へ戻る（画面のボタンと AI の層が同じものを使う）
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/                  # entries（日記の一覧）・new-entry（書く）
```

| URL | ページ |
| --- | --- |
| `/diary/` | 日記の一覧 |
| `/diary/new` | 書く |

* `setDraftField(field, value)` は入力欄の 1 文字ごとにも呼ばれる。`save()` は空の項目があれば断り、`{ ok: false, missing }` を返す（画面は理由を出す）
* 公開時は、`/diary/*` のどの URL も `/diary/index.html` を返す設定が要る（管理画面と同じ）
* 開発: `bun run dev` → http://localhost:5173/diary/（直接は http://localhost:5179/diary/）
