# 予約フォーム（apps/reservation）

小さな食堂「とまり木」の予約フォーム。空き状況を見ながら日時・人数・席を選んで予約を送る。普通のサイトとして作り、AI の層を後から足す。

## サイト

* フォーム: 日付・時刻・人数・席・クーポンコード（任意）
* ルール（入力の下にエラーを出す。値が入った欄はその場で、空の欄は「予約する」を押したとき）

  | 項目 | ルール |
  | --- | --- |
  | 日付 | 今日以降。火曜は定休日。満席の日は選べない |
  | 時刻 | 17:00〜21:00 の 30 分ごと。満席の時刻は選べない（「19:00（満席）」） |
  | 人数 | 1〜8 名 |
  | 席 | テーブル席・カウンター席（2 名まで）・個室（4 名から） |
  | クーポンコード | 半角の英大文字と数字。全角・小文字はエラーにして、黙って直さない。ダミーで `TOMARI10`・`WELCOME`（ドリンク 1 杯サービス） |

* 空き状況のカレンダー: 1 週間（月〜日）。○ 空きあり / △ 残りわずか（4 枠以下）/ × 満席 / 休 定休日。前の週・次の週に送れる（今週より前には戻らない）。日を押すとフォームの日付に入る。フォームの日付を変えると、カレンダーもその週になる
* 空き状況はダミー: 金曜の 19:00・19:30、土曜の 18:00〜20:00 は満席。毎月 15 日は貸し切りで満席
* 送信: ダミーの API（`reservation-api.ts`。通信せず、0.8 秒待って予約番号を返す）。送信中はフォームを変えられない（`<fieldset disabled>`）。終わると「予約を受け付けました（予約番号 1001）」と中身を出し、フォームを空に戻す。受け付けの表示は、次に入力を変えるまで出す
* 今日は開いたときの端末の日付。名前・電話番号は聞かない（個人情報を扱わない）。状態は保存しない
* 文言は ja / en。日付は `Intl` で言語に合わせる（「10月9日(金)」「Fri, October 9」）

## 構成

```
src/
  main.tsx / app.tsx      # I18nProvider > ReservationProvider > ConfirmProvider > レイアウト + ページ、<Ai />
  reservation/            # 普通のサイトの機能
    dates.ts              #   日付（"YYYY-MM-DD" の文字列。計算は dayjs）
    availability.ts       #   時刻・定休日・ダミーの空き状況
    reservation-form.ts   #   入力の型・ルール（zod のスキーマ）・エラーの一覧（formErrors）
    reservation-api.ts    #   ダミーの予約 API
    reservation-provider.tsx  # フォーム（React Hook Form）とカレンダーの週を持ち、関数を出す（useReservation）
  i18n/                   # 文言（ja / en）・言語の state・日付の形（format.ts）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/home/             # 受け付けの表示・カレンダー（availability-calendar / day-button）・フォーム（reservation-form / form-field）
  commands/               # 足した層: 予約フォームの Command（useReservation の関数を呼ぶ）
  confirm/                # 足した層: 確認ダイアログ（useConfirm）
  ai/ai.tsx               # 足した層: <Ai />。AI 向けツール・WebMCP・右下のチャット
```

* `app.tsx` から `<Ai />` を外しても、サイトはそのまま動く
* フォームは React Hook Form と zod（`zodResolver`）。よくある React のフォームの書き方に AI の層を足せることを見せるため
  * 日付・クーポンは `register`、時刻・人数・席（shadcn の部品）は `Controller` でつなぐ
  * `mode: "onChange"`: 値を変えた欄はその場で、空の欄は「予約する」（`handleSubmit`）のときにエラーを出す
  * 入力の値はどれも文字列（選んでいなければ `""`）
* ルールは zod の `superRefine` で書く。項目をまたぐもの（席と人数・時刻と日付）もここ。エラーの `message` はエラーの種類（`closed` など）で、画面は `error.<項目>.<種類>` の文言にする
* `useReservation` の `fill(patch)` は、変わった項目だけを React Hook Form の `setValue` で入れる（カレンダーの日を押したとき）
* `useReservation` の `submit()` は「予約する」と同じ `handleSubmit` を通り、結果（受け付けた予約番号・送信中・入力のエラー）を返す。画面は返り値を使わない

## Command

どの Command も、画面の操作と同じサイトの関数を呼ぶ（AI 用の特別な操作は作らない）。

| Command | 引数 | 画面の同じ操作 | AI が実行するとき |
| --- | --- | --- | --- |
| `fill_reservation_form` | `date?`（YYYY-MM-DD）・`time?`（HH:MM）・`party_size?`・`seat?`（`table` / `counter` / `private`）・`coupon_code?` | 入力欄に入れる（React Hook Form の `setValue`。人は入力欄から 1 項目ずつ、AI は `fill(patch)` で分かった項目をまとめて） | そのまま実行 |
| `show_availability` | `week_of`（YYYY-MM-DD） | カレンダーの前の週・次の週 | そのまま実行。今週より前は失敗 |
| `submit_reservation` | なし | 「予約する」（同じ `submit()` を呼ぶ） | 入力にエラーがあれば確認せずに失敗を返す（同じ処理なので画面にも空の欄のエラーが出る）。なければ確認ダイアログ（「10月7日(水) 19:00、2 名、テーブル席で予約します。」） |

* `fill_reservation_form` は、入れた値にエラーがあっても値は残し（人が入力したときと同じ）、失敗としてエラーを返す: `the form was filled in, but coupon_code: use half-width uppercase letters and digits (got "tomari10")`
* 成功したときも、AI が次の一手を決めるための英文を返す（小さいモデルが、入れただけで「予約しました」と言わないように）

  | Command | いつ | message |
  | --- | --- | --- |
  | `fill_reservation_form` | 足りない項目がある | `filled in; not sent yet. still missing: party_size, seat (ask the user for them one at a time)` |
  | | すべて埋まった | `filled in; not sent yet. all fields are filled; ask the user whether to book it` |
  | `submit_reservation` | 受け付けた | `reservation 1001 was made for 2026-10-08 19:00, 2 people, table` |

* エラーの英文（`describeError`）

  | エラー | message |
  | --- | --- |
  | 定休日 | `date: 2026-10-13 is a Tuesday; the restaurant is closed on Tuesdays` |
  | 過ぎた日 | `date: 2026-10-01 is in the past (today: 2026-10-06)` |
  | 満席の時刻 | `time: 19:00 on 2026-10-09 is fully booked (available: 17:00, …)` |
  | 席と人数 | `seat: counter seats are for up to 2 people (party_size: 4)` |
  | クーポンの形 | `coupon_code: use half-width uppercase letters and digits (got "ｔｏｍａｒｉ１０")` |
  | 空の欄（送るとき） | `date is required; time is required; …` |
  | 送信中 | `a reservation is being sent; try again after it finishes` |

* `get_state` は次を返す。空き状況はカレンダーに出ている週だけ（画面に見えている分）。ほかの週は `show_availability` で週を送ってから読む

  ```ts
  {
    today: { date, weekday },
    form: { date, time, party_size, seat, coupon_code },
    errors: ["..."],                      // 今の入力のエラー（空の欄は除く）
    calendar: [{ date, weekday, status, available_times }],  // status: available / few / full / closed / past
  }
  ```

## AI から操作する

ほかの題材と同じ。右下のボタンからチャットを開き、Claude / Gemini Nano / Qwen3.5 4B を選んで話しかける。

* システムプロンプト: 今日の日付と曜日（小さいモデルは `get_state` を読まずに日付を作りがちなので、プロンプトにも書く）・分かった項目から入れる・足りない項目は 1 つずつ聞く・エラーは直すか聞く・すべて埋まってユーザーが望んだら送る・ほかの週は `show_availability` の後に `get_state` を読む・予約と関係のない頼みは短く断る
* 話しかけ方の例: 「明日の 19 時に予約したい」「来週の空いている日は？」「クーポン ｔｏｍａｒｉ１０ を使いたい」
* 小さいローカル LLM（Qwen3.5 4B）は、足りない項目を聞き返す対話が苦手（`docs/history/2026-10-06-reservation-app.md`）。一度に全部伝えると入れられる。成功の結果で「まだ送っていない・足りない項目」を返すようにした（#77）。全サイトでの比べは #78

## 開発

* 開発: `bun run dev` → http://localhost:5173/reservation/（直接は http://localhost:5177/reservation/）
