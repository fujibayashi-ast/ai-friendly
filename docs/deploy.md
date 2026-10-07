# 公開（Cloudflare Pages）

サーバーを持たない SPA として、Cloudflare Pages に公開する。ルートの `bun run build` が作る `dist/` をそのまま出す。

```
dist/
  index.html            # トップ（apps/home）
  _redirects            # ページ遷移のあるサンプルの URL（apps/home/public/_redirects）
  _headers              # WebMCP の origin trial のトークン（apps/home/public/_headers）
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

## WebMCP の origin trial（`_headers`）

WebMCP（`document.modelContext`）は Chrome の origin trial 中で、トークンを付けたサイトでは、見に来た人がフラグを入れなくても使える。全パスに `Origin-Trial` ヘッダーで付ける。

```
/*
  Origin-Trial: <トークン>
```

* トークンは https://developer.chrome.com/origintrials で `https://ai-friendly-2i0.pages.dev` を登録して受け取る。秘密ではない（ページに出る値）のでコミットする
* 期限は 2027-03-30。切れたら同じページで延長し、新しいトークンに差し替える
* サブドメインも対象にしているので、PR のプレビューの URL（`xxxx.ai-friendly-2i0.pages.dev`）でも効く。手元の `localhost` では効かないので、Chrome のフラグで試す
* 各アプリの `index.html` の meta タグにはしない（同じトークンを何か所にも書くことになる）
* WebMCP が使えないブラウザでは、登録をしないだけで、サイト・チャットはそのまま動く

## 手元で確かめる

```bash
bun run build
bunx wrangler pages dev dist
```

`wrangler` は Pages の動き（`_redirects`・`_headers` を含む）をまねる。依存には入れず、確かめるときだけ `bunx` で使う。
