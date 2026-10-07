# 公開（Cloudflare Pages）

サーバーを持たない SPA として、Cloudflare Pages に公開する。ルートの `bun run build` が作る `dist/` をそのまま出す。

```
dist/
  index.html            # トップ（apps/home）
  _redirects            # ページ遷移のあるサンプルの URL（apps/home/public/_redirects）
  settings/ tasks/ shop/ reservation/ admin/ diary/   # 各サンプル（apps/<id>/dist）
```

## Cloudflare の設定

Cloudflare Pages の Git 連携で、このリポジトリをつなぐ。

| 項目 | 値 |
| --- | --- |
| 本番のブランチ | `main` |
| ビルドコマンド | `bun install --frozen-lockfile && bun run build` |
| ビルドの出力 | `dist` |
| 環境変数 | `BUN_VERSION=1.4.2`（Pages の既定の bun は古いため） |

* main に push すると本番、PR ごとにプレビューの URL が出る
* リポジトリに API トークンなどは置かない
* 外部への通信は増えない。LLM のモデルのダウンロード・Claude API は、今までどおりユーザーが選んだときだけ

## ページ遷移のあるサンプル（`_redirects`）

管理画面（`/admin/orders/1026` など）・日記（`/diary/new`）は、ページを直接開いた・再読み込みしたときも、そのアプリの `index.html` を返す必要がある。Pages は、どこにもないパスにトップの `index.html` を返すので、何もしないとトップが出る。

```
/admin/orders     /admin/ 200
/admin/orders/*   /admin/ 200
/admin/products   /admin/ 200
/diary/new        /diary/ 200
```

* `200` は転送せずに中身を返す（URL はそのまま。React Router が URL を読んでページを出す）
* ページの URL だけを書く。Pages のリダイレクトは、ファイルがあっても必ず適用されるので、`/admin/* /admin/ 200` とまとめると `/admin/assets/*.js` まで書き換わる
* サンプルにページ（ルート）を足したら、ここにも足す
* どのルートにも当たらない URL（`/admin/foo`）はトップが出る

## 手元で確かめる

```bash
bun run build
bunx wrangler pages dev dist
```

`wrangler` は Pages の動き（`_redirects` を含む）をまねる。依存には入れず、確かめるときだけ `bunx` で使う。
