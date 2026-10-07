# 日記（apps/diary）

おまけ（遊び・実験）のサンプル。小さな日記のサイトで、AI の操作を仮のマウスカーソルの動きと打ち込みで見せる。サイトは普通に作り、AI の層とカーソルの演出を後から足す。

## 構成

```
src/
  main.tsx                # BrowserRouter（basename: /diary/）
  app.tsx                 # I18nProvider > ルート（Layout の中に各ページ）
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/                  # entries（日記の一覧）・new-entry（書く）
```

| URL | ページ |
| --- | --- |
| `/diary/` | 日記の一覧 |
| `/diary/new` | 書く |

* 公開時は、`/diary/*` のどの URL も `/diary/index.html` を返す設定が要る（管理画面と同じ）
* 開発: `bun run dev` → http://localhost:5173/diary/（直接は http://localhost:5179/diary/）
