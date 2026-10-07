# 管理画面（apps/admin）

ネットショップ「くらしの店」の管理画面。注文と商品・在庫を、いくつかのページに分けて扱う。普通のサイトとして作り、AI の層を後から足す。主役はページ遷移の Command。

## 構成

```
src/
  main.tsx                # BrowserRouter（basename: /admin/）
  app.tsx                 # I18nProvider > ルート（Layout の中に各ページ）
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）・左のメニュー（side-nav）
  pages/                  # orders（注文一覧）・order（注文の詳細）・products（商品・在庫）
```

| URL | ページ |
| --- | --- |
| `/admin/` | 注文一覧へ転送 |
| `/admin/orders` | 注文一覧 |
| `/admin/orders/:id` | 注文の詳細 |
| `/admin/products` | 商品・在庫 |

* ページ遷移は React Router（宣言的な書き方: `BrowserRouter`・`Routes`・`NavLink`）
* 公開時は、`/admin/*` のどの URL も `/admin/index.html` を返す設定が要る（直接開いた・再読み込みしたとき）。設定は公開の Issue で行う
* 開発: `bun run dev` → http://localhost:5173/admin/（直接は http://localhost:5178/admin/）
