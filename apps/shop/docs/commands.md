# ネットショップ（apps/shop）

商品を絞り込み・並べ替えて探し、カートに入れて注文する小さなお店。普通のサイトとして作り、AI の層を後から足す。

## サイト

* 商品はダミーの 8 つ（食品・キッチン・文房具）。ID は `"1"` のような短い連番。名前は ja / en で持ち、表示中の言語で出す。写真の代わりにカテゴリのアイコンを置く
* 一覧の上で、カテゴリ（すべて・食品・キッチン・文房具）の絞り込みと、並べ替え（おすすめ順・価格の安い順・価格の高い順）ができる。おすすめ順はデータの並び
* 商品の状態

  | 状態 | 条件 | 表示 |
  | --- | --- | --- |
  | 販売中 | 在庫がある | 「カートに入れる」。在庫からカートの分を引いて 3 点以下なら「残り 2 点」（カートに入れると減る） |
  | 売り切れ | 在庫 0 | 「売り切れ」。カートに入れられない |
  | 発売前 | `releaseDate` がある | 「11月20日 発売予定」。カートに入れられない。今日の日付とは比べない |

* カート: 数量の変更（1 から在庫まで）・削除・合計。カートの分が在庫に達したら「在庫の上限です」で入れられない。広い画面では一覧の右、スマホでは下
* 注文: ダミーの API（`order-api.ts`。通信せず、0.8 秒待って注文番号を返す）。送信中はカートを変えられない（ボタンを押せなくするだけでなく、`ShopProvider` の関数も送信中は何もしない。二重の注文も防ぐ）。終わると「注文しました（注文番号 1001）」と出し、カートを空にして、注文した数だけ在庫を減らす
* 状態は React の state に持ち、保存しない（再読み込みで最初に戻る）
* 文言は ja / en（右上で切り替え）。金額・日付は `Intl` で言語に合わせる
* 会員・支払い・配送先・在庫の管理（入荷）は扱わない

## 構成

```
src/
  main.tsx / app.tsx      # I18nProvider > ShopProvider > ConfirmProvider > レイアウト + ページ、<Ai />
  shop/                   # 普通のサイトの機能
    products.ts           #   商品の型とダミーのデータ
    shop.ts               #   状態の型と、状態を変える純粋な関数（絞り込み・並べ替え・カート・注文後の在庫）
    order-api.ts          #   ダミーの注文 API
    shop-provider.tsx     #   useState で持ち、関数を出す（useShop）
  i18n/                   # 文言（ja / en）・言語の state・金額と日付の形（format.ts）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/home/             # 絞り込み・並べ替え（product-filters）・商品（product-list / product-card）・カート（cart / cart-line）
  commands/               # 足した層: ネットショップの Command（useShop の関数を呼ぶ）
  confirm/                # 足した層: 確認ダイアログ（useConfirm）
  ai/ai.tsx               # 足した層: <Ai />。AI 向けツール・WebMCP・右下のチャット
```

* `app.tsx` から `<Ai />` を外しても、サイトはそのまま動く

* `shop.ts` の関数は、販売中でない商品や在庫を超える数を黙ってそろえる（画面ではそもそも押せない）

## Command

| Command | 引数 | 内容 | AI が実行するとき |
| --- | --- | --- | --- |
| `set_category` | `category: "all" \| "food" \| "kitchen" \| "stationery"` | 一覧をカテゴリで絞り込む | そのまま実行 |
| `sort_products` | `order: "recommended" \| "price_asc" \| "price_desc"` | 一覧を並べ替える | そのまま実行 |
| `add_to_cart` | `product_id: string`・`quantity: number`（1 以上の整数。省略すると 1） | カートに入れる | そのまま実行 |
| `set_cart_quantity` | `product_id: string`・`quantity: number`（1 以上の整数） | カートの数量を変える | そのまま実行 |
| `remove_from_cart` | `product_id: string` | カートから削除する | そのまま実行 |
| `place_order` | なし | カートの中身を注文する（ダミーの API を待つ） | 確認ダイアログ（「合計 ￥3,480 の注文を確定します。」）。カートが空なら確認せずに失敗を返す |

* `get_state` は次を返す。商品は絞り込みに関係なく全部返す（ほかのカテゴリの商品もカートに入れられるように）

  ```ts
  {
    category, order,                     // 今の表示
    products: [{ id, name, category, price, stock, status, release_date? }],
    cart: [{ product_id, name, quantity }],
    total,
  }
  ```

  * `name` は表示中の言語。`status` は `"available"` / `"sold_out"` / `"coming_soon"`
* 失敗は `domain_error` で、AI が読んで直せる英文を返す

  | 場面 | message |
  | --- | --- |
  | 売り切れ | `add_to_cart: product "3" is sold out` |
  | 発売前 | `add_to_cart: product "5" is not on sale yet (release date: 2026-11-20)` |
  | 在庫を超える（カートの分と合わせて） | `add_to_cart: only 2 left for product "6"` |
  | 存在しない ID | `add_to_cart: product "9" not found (ids: 1, 2, …, 8)` |
  | カートにない | `remove_from_cart: product "1" is not in the cart (cart: 6)` |
  | 空のカートで注文 | `place_order: the cart is empty` |

* サイトの関数（`shop.ts`）は、売り切れや在庫を超える数を黙ってそろえる。Command は呼ぶ前に確かめて、そろえずに理由を返す（AI がユーザーに伝えられるように）
* `place_order` の `run` は Promise を返す（ダミーの API を待つ）。AI への結果は注文が終わってから返る
* 確認の文言は Command の定義（`confirmation`）が持つ。合計金額は `Intl` で表示中の言語に合わせる
* 状態が変わるたびに Command と AI 向けツールを作り直す（`get_state` と在庫の確認が今の状態を使うように）

## AI から操作する

settings・やることリストと同じ。右下のボタンからチャットを開き、Claude / Gemini Nano / Qwen3.5 4B を選んで話しかける。

* システムプロンプト: このネットショップを操作する・カートを変える前に `get_state` で ID・在庫・状態を見る・売り切れや発売前なら入れずに伝える・ショップと関係のない頼みは短く断る・ユーザーの言語で短く返事する
* 話しかけ方の例: 「はちみつを 2 つカートに入れて」「キッチン用品を安い順に見せて」「注文して」
* 開発中（`bun run dev`）は、devtools のコンソールで `window.__aiTools` から同じツールを呼べる

## 開発

* 開発: `bun run dev` → http://localhost:5173/shop/（直接は http://localhost:5176/shop/）
