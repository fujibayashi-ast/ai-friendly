# 予約フォーム（apps/reservation）

小さな食堂「とまり木」の予約フォーム。空き状況を見ながら日時・人数・席を選んで予約を送る。普通のサイトとして作り、AI の層を後から足す。

## 構成

```
src/
  main.tsx / app.tsx      # I18nProvider > レイアウト + ページ
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/home/             # 予約フォーム
```

* 開発: `bun run dev` → http://localhost:5173/reservation/（直接は http://localhost:5177/reservation/）
