# ネットショップ（apps/shop）

商品を絞り込み・並べ替えて探し、カートに入れて注文する小さなお店。普通のサイトとして作り、AI の層を後から足す。

## 構成

```
src/
  main.tsx / app.tsx      # I18nProvider > レイアウト + ページ
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/home/             # 商品一覧
```

* 開発: `bun run dev` → http://localhost:5173/shop/（直接は http://localhost:5176/shop/）
