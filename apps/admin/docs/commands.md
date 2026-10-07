# 管理画面（apps/admin）

ネットショップ「くらしの店」の管理画面。注文と商品・在庫を、いくつかのページに分けて扱う。普通のサイトとして作り、AI の層を後から足す。主役はページ遷移の Command。

## サイト

* 注文一覧: 新しい順に 30 件（ダミー。注文番号は 1001〜1030、商品 ID は 1〜12 の数値）。状態（すべて / 未発送 / 発送済み）とお客さまの名前・注文番号で絞り込む。名前は ja / en のどちらでも、空白を無視して探す（「佐藤花子」「hanako sato」）
* 注文の詳細: 注文日・お客さま・商品・合計。未発送なら「発送済みにする」
* 商品・在庫: 12 件。「在庫が n 個以下」で絞り込み、行ごとに在庫数（0〜999）を変えて保存する
* 絞り込みは URL の検索条件に入れる（`/orders?status=pending&q=佐藤`・`/products?max_stock=5`）。戻る・再読み込みで保たれ、URL を渡せば同じ一覧を開ける
* 名前はダミー。状態は保存しない（再読み込みで最初に戻る）
* 文言は ja / en。金額・日付は `Intl` で言語に合わせる

## 構成

```
src/
  main.tsx                # BrowserRouter（basename: /admin/）
  app.tsx                 # I18nProvider > AdminProvider > ConfirmProvider > ルート（Layout の中に各ページ）、<Ai />
  admin/                  # 普通のサイトの機能
    data.ts               #   注文・商品の型とダミーのデータ
    admin.ts              #   絞り込み・合計・状態を変える純粋な関数・だめな理由（markShippedError など）
    admin-provider.tsx    #   useState で持ち、関数を出す（useAdmin）。ルーターより上に置き、どのページからも同じ関数を呼べる
  routes/paths.ts         # ページの URL を作る・読む（ordersPath / orderPath / productsPath・readOrderFilters など）
  i18n/                   # 文言（ja / en）・言語の state（I18nProvider・useI18n）
  layout/                 # ヘッダー（サイト名・言語の切り替え）・左のメニュー（side-nav）
  pages/                  # orders（注文一覧）・order（注文の詳細）・products（商品・在庫）
  commands/               # 足した層: ページ遷移と操作の Command（paths.ts と navigate、useAdmin の関数を呼ぶ）
  confirm/                # 足した層: 確認ダイアログ（useConfirm）
  ai/                     # 足した層: <Ai />（AI 向けツール・WebMCP・右下のチャット）・page-state.ts（get_state）
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
* `app.tsx` から `<Ai />` を外しても、サイトはそのまま動く
* 公開時は、`/admin/*` のどの URL も `/admin/index.html` を返す設定が要る（直接開いた・再読み込みしたとき）。設定は公開の Issue で行う

## Command

どのページにいても、全部の Command を使える。ページ遷移の Command は、画面のリンク・絞り込みと同じ `routes/paths.ts` の URL と React Router の `navigate()` を使う。

| Command | 引数 | 画面の同じ操作 | AI が実行するとき |
| --- | --- | --- | --- |
| `show_orders` | `status?`（`pending` / `shipped`）・`query?`（名前・注文番号） | メニューの「注文」・状態のトグル・検索 | そのまま実行。開いた一覧に見えている注文を返す |
| `show_order` | `order_id`（数値） | 一覧の注文番号のリンク | そのまま実行。見つからなければ開かずに失敗 |
| `show_products` | `max_stock?`（0 以上の整数） | メニューの「商品・在庫」・「在庫が n 個以下」 | そのまま実行。開いた一覧に見えている商品を返す |
| `mark_order_shipped` | `order_id`（数値） | 注文の詳細の「発送済みにする」 | 確認ダイアログ（「注文 1026（渡辺 翔 さま）を発送済みにします。」）。見つからない・発送済みは確認せずに失敗 |
| `set_stock` | `product_id`（数値）・`stock`（整数） | 商品の行の在庫を変えて「保存」 | そのまま実行 |

* ページ遷移の結果は、開いたページに見えているものを短く返す（小さいモデルは `get_state` を読まずに番号を作りがちなため）

  | Command | message |
  | --- | --- |
  | `show_orders` | `the order list now shows 1 orders: 1026 渡辺 翔 (pending)` |
  | `show_order` | `the order page now shows order 1029 (pending, 山本 結衣): 万年筆 x2; total 11600` |
  | `show_products` | `the product list now shows 2 products: 3 クッキー缶 (stock 0), 12 オリーブオイル (stock 1)` |

* 失敗の英文

  | 場面 | message |
  | --- | --- |
  | 存在しない注文 | `show_order: order "9999" not found; use show_orders to search` |
  | 発送済みの注文 | `mark_order_shipped: order "1026" is already shipped` |
  | 存在しない商品 | `set_stock: product "99" not found (ids: 1, 2, …, 12)` |
  | 在庫の範囲 | `set_stock: stock must be a whole number from 0 to 999` |

* `get_state` は今のページと、画面に見えている行だけを返す（`ai/page-state.ts`）。ほかの行は、ページを移ってから読む

  ```ts
  { page: "orders", filters: { status, query }, orders: [{ id, date, customer, total, status }] }
  { page: "order", order: { id, date, customer, items: [{ product_id, name, quantity }], total, status } | null }
  { page: "products", filters: { max_stock }, products: [{ id, name, price, stock }] }
  ```

* 注文番号・商品 ID は数値。Qwen3.5 4B（WebLLM）は、`"1026"` のような数字だけの文字列を書く途中で JSON が切れることがあった（#93・`docs/history/2026-10-07-admin-app.md`）

## AI から操作する

ほかの題材と同じ。右下のボタンからチャットを開き、Claude / Gemini Nano / Qwen3.5 4B を選んで話しかける。

* システムプロンプト: `get_state` は今のページだけ・探すときはページを開いてから読む・名前は「さん」を付けずに探す・エラーは直すか伝える・この管理画面と関係のない頼みは短く断る
* 話しかけ方の例: 「渡辺さんの注文を発送済みにして」「在庫が 5 個以下の商品を見せて」「未発送の注文は何件？」

## 開発

* 開発: `bun run dev` → http://localhost:5173/admin/（直接は http://localhost:5178/admin/）
