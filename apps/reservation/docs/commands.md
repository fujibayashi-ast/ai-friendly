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
  main.tsx / app.tsx      # I18nProvider > ReservationProvider > レイアウト + ページ
  reservation/            # 普通のサイトの機能
    dates.ts              #   日付（"YYYY-MM-DD" の文字列。計算は dayjs）
    availability.ts       #   時刻・定休日・ダミーの空き状況
    reservation-form.ts   #   入力の型・ルール（zod のスキーマ）・エラーの一覧（formErrors）
    reservation-api.ts    #   ダミーの予約 API
    reservation-provider.tsx  # フォーム（React Hook Form）とカレンダーの週を持ち、関数を出す（useReservation）
  i18n/                   # 文言（ja / en）・言語の state・日付の形（format.ts）
  layout/                 # ヘッダー（サイト名・言語の切り替え）
  pages/home/             # 受け付けの表示・カレンダー（availability-calendar / day-button）・フォーム（reservation-form / form-field）
```

* フォームは React Hook Form と zod（`zodResolver`）。よくある React のフォームの書き方に AI の層を足せることを見せるため
  * 日付・クーポンは `register`、時刻・人数・席（shadcn の部品）は `Controller` でつなぐ
  * `mode: "onChange"`: 値を変えた欄はその場で、空の欄は「予約する」（`handleSubmit`）のときにエラーを出す
  * 入力の値はどれも文字列（選んでいなければ `""`）
* ルールは zod の `superRefine` で書く。項目をまたぐもの（席と人数・時刻と日付）もここ。エラーの `message` はエラーの種類（`closed` など）で、画面は `error.<項目>.<種類>` の文言にする
* `useReservation` の `fill(patch)` は、変わった項目だけを React Hook Form の `setValue` で入れる（カレンダーの日を押したとき）

## 開発

* 開発: `bun run dev` → http://localhost:5173/reservation/（直接は http://localhost:5177/reservation/）
