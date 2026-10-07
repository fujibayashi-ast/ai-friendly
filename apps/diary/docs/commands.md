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
  app.tsx                 # I18nProvider > DiaryProvider > ルート（Layout の中に各ページ）、<Ai />
  diary/                  # 普通のサイトの機能
    diary.ts              #   日記・書きかけの型・並び順・保存できない理由（missingFields）
    entries.ts            #   ダミーの日記
    diary-provider.tsx    #   日記と書きかけを持ち、関数を出す（useDiary: setDraftField / save）
    use-save-entry.ts     #   「保存」して一覧へ戻る（画面のボタンと AI の層が同じものを使う）
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/                  # entries（日記の一覧）・new-entry（書く）
  commands/               # 足した層: 日記の Command（@ai-friendly/assistant/cursor の pointer でカーソルを動かしてから、useDiary の関数を呼ぶ）
  ai/ai.tsx               # 足した層: <Ai />（AI 向けツール・WebMCP・右下のチャット）
```

| URL | ページ |
| --- | --- |
| `/diary/` | 日記の一覧 |
| `/diary/new` | 書く |

* `setDraftField(field, value)` は入力欄の 1 文字ごとにも呼ばれる。`save()` は空の項目があれば断り、`{ ok: false, missing }` を返す（画面は理由を出す）
* `app.tsx` から `<Ai />` を外しても、サイトはそのまま動く
* 公開時は、`/diary/*` のどの URL も `/diary/index.html` を返す設定が要る（管理画面と同じ）

## Command

どの Command も、カーソルで画面の同じ操作をして見せてから、画面と同じサイトの関数を呼ぶ。

| Command | 引数 | 画面の同じ操作 | AI が実行するとき |
| --- | --- | --- | --- |
| `open_new_entry` | なし | 一覧の「書く」 | カーソルが「書く」を押し、書くページへ |
| `fill_entry` | `title?`・`body?` | タイトル・本文の入力（`setDraftField`） | 書くページにいなければ、先に「書く」を押す。タイトル・本文の順に、欄を押して 1 文字ずつ打ち込む |
| `save_entry` | なし | 「保存」（`useSaveEntry`） | カーソルが「保存」を押す。保存できたら一覧へ。空の項目があれば失敗 |

* 成功の英文: `fill_entry` は `filled in; not saved yet. every field is filled, so save it now unless the user wants changes`（足りなければ `still missing: body`）。ツール名を書くと、小さいモデルが返事にそのまま出す（#77 と同じ）
* `get_state`: `{ writing: { title, body, missing }, recent: [title] }`（一覧は新しい 5 件のタイトルだけ）

## カーソルの演出

カーソルは `@ai-friendly/assistant/cursor` の `pointer` を使う（動き・押す先の探し方・`prefers-reduced-motion` は [docs/assistant.md](../../../docs/assistant.md)）。日記で決めているのは、何をどの順に押すかだけ。

* 押す先は画面の文言で指す（`{ button: t("entries.write") }`・`{ field: t("newEntry.title.label") }`）。言語を切り替えても、同じ `t` で探すので見つかる
* AI の返事が終わったら、チャット（`Chat`）がカーソルを隠す

## AI から操作する

ほかの題材と同じ。右下のボタンからチャットを開き、Claude / Gemini Nano / Qwen3.5 4B を選んで話しかける。

* システムプロンプト: 話を聞いたら短いタイトル・2〜4 文の本文（ユーザーの言葉で、一人称）を `fill_entry` で一度に入れ、`save_entry` で保存する・日記と関係のない頼みは短く断る
* 話しかけ方の例: 「今日は雨で家にいた。カレーを作ったって日記を書いて」「晴れて散歩した日のことを書いて」

## 開発

* 開発: `bun run dev` → http://localhost:5173/diary/（直接は http://localhost:5179/diary/）
