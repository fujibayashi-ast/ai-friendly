# 管理画面（apps/admin）

ネットショップ「くらしの店」の管理画面。注文と商品・在庫を、いくつかのページに分けて扱う。普通のサイトとして作り、AI の層を後から足す。主役はページ遷移の Command。

## サイト

* 注文一覧: 新しい順に 30 件（ダミー）。状態（すべて / 未発送 / 発送済み）とお客さまの名前・注文番号で絞り込む。名前は ja / en のどちらでも、空白を無視して探す（「佐藤花子」「hanako sato」）
* 注文の詳細: 注文日・お客さま・商品・合計。未発送なら「発送済みにする」
* 商品・在庫: 12 件。「在庫が n 個以下」で絞り込み、行ごとに在庫数（0〜999）を変えて保存する
* 絞り込みは URL の検索条件に入れる（`/orders?status=pending&q=佐藤`・`/products?max_stock=5`）。戻る・再読み込みで保たれ、URL を渡せば同じ一覧を開ける
* 名前はダミー。状態は保存しない（再読み込みで最初に戻る）
* 文言は ja / en。金額・日付は `Intl` で言語に合わせる

## 構成

```
src/
  main.tsx                # BrowserRouter（basename: /admin/）
  app.tsx                 # I18nProvider > AdminProvider > ルート（Layout の中に各ページ）
  admin/                  # 普通のサイトの機能
    data.ts               #   注文・商品の型とダミーのデータ
    admin.ts              #   絞り込み・合計・状態を変える純粋な関数・だめな理由（markShippedError など）
    admin-provider.tsx    #   useState で持ち、関数を出す（useAdmin）。ルーターより上に置き、どのページからも同じ関数を呼べる
  routes/paths.ts         # ページの URL を作る・読む（ordersPath / orderPath / productsPath・readOrderFilters など）
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

* ページ遷移は React Router（宣言的な書き方: `BrowserRouter`・`Routes`・`NavLink`・`useSearchParams`）
* 画面のリンク・絞り込みは `routes/paths.ts` で URL を作り、`<Link>` / `navigate()` で移る。AI の層のページ遷移の Command も同じ関数を使う
* 発送済みにする・在庫を変えるときのだめな理由（存在しない注文・発送済み・在庫の範囲）は `admin.ts` が決め、`useAdmin` の `markShipped` / `setStock` が `{ ok: true } | { ok: false, error }` を返す。画面は返り値を使わない
* 公開時は、`/admin/*` のどの URL も `/admin/index.html` を返す設定が要る（直接開いた・再読み込みしたとき）。設定は公開の Issue で行う
* 開発: `bun run dev` → http://localhost:5173/admin/（直接は http://localhost:5178/admin/）
