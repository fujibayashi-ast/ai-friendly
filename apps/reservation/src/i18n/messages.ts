export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "食堂 とまり木",
  heading: "ご予約",
  "language.label": "言語",
  "calendar.title": "空き状況",
  "calendar.prev": "前の週",
  "calendar.next": "次の週",
  "calendar.day": "{date}・{status}",
  "status.available": "空きあり",
  "status.few": "残りわずか",
  "status.full": "満席",
  "status.closed": "定休日",
  "form.title": "予約の内容",
  "form.date": "日付",
  "form.time": "時刻",
  "form.time.placeholder": "時刻を選ぶ",
  "form.time.full": "{time}（満席）",
  "form.partySize": "人数",
  "form.partySize.placeholder": "人数を選ぶ",
  "form.partySize.option": "{count} 名",
  "form.seat": "席",
  "form.seat.hint": "カウンター席は 2 名まで、個室は 4 名からです。",
  "seat.table": "テーブル席",
  "seat.counter": "カウンター席",
  "seat.private": "個室",
  "form.couponCode": "クーポンコード（任意）",
  "form.couponCode.hint":
    "半角の英大文字と数字で入力してください（例: TOMARI10）。",
  "form.submit": "予約する",
  "form.submitting": "送信しています…",
  "error.date.required": "日付を選んでください。",
  "error.date.invalid": "日付の形が正しくありません。",
  "error.date.past": "過ぎた日付は選べません。",
  "error.date.closed": "火曜日は定休日です。",
  "error.date.full": "この日は満席です。",
  "error.time.required": "時刻を選んでください。",
  "error.time.invalid": "17:00〜21:00 の 30 分ごとの時刻を選んでください。",
  "error.time.full": "この時刻は満席です。",
  "error.partySize.required": "人数を選んでください。",
  "error.partySize.range": "人数は 1〜8 名です。",
  "error.seat.required": "席を選んでください。",
  "error.seat.counter": "カウンター席は 2 名までです。",
  "error.seat.private": "個室は 4 名からです。",
  "error.couponCode.format": "半角の英大文字と数字で入力してください。",
  "error.couponCode.unknown": "このクーポンコードは使えません。",
  "completed.title": "予約を受け付けました（予約番号 {number}）",
  "completed.summary": "{date} {time}・{count} 名・{seat}",
  "completed.coupon": "クーポン {code}（ドリンク 1 杯サービス）",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "Tomarigi Diner",
  heading: "Reservations",
  "language.label": "Language",
  "calendar.title": "Availability",
  "calendar.prev": "Previous week",
  "calendar.next": "Next week",
  "calendar.day": "{date}, {status}",
  "status.available": "Available",
  "status.few": "Few left",
  "status.full": "Full",
  "status.closed": "Closed",
  "form.title": "Your reservation",
  "form.date": "Date",
  "form.time": "Time",
  "form.time.placeholder": "Choose a time",
  "form.time.full": "{time} (full)",
  "form.partySize": "Party size",
  "form.partySize.placeholder": "Choose party size",
  "form.partySize.option": "Party of {count}",
  "form.seat": "Seat",
  "form.seat.hint":
    "Counter seats are for up to 2 people, private rooms for 4 or more.",
  "seat.table": "Table",
  "seat.counter": "Counter",
  "seat.private": "Private room",
  "form.couponCode": "Coupon code (optional)",
  "form.couponCode.hint":
    "Use half-width uppercase letters and digits (e.g. TOMARI10).",
  "form.submit": "Reserve",
  "form.submitting": "Sending…",
  "error.date.required": "Choose a date.",
  "error.date.invalid": "The date is not in a valid format.",
  "error.date.past": "You can't choose a past date.",
  "error.date.closed": "We are closed on Tuesdays.",
  "error.date.full": "This day is fully booked.",
  "error.time.required": "Choose a time.",
  "error.time.invalid":
    "Choose a time between 17:00 and 21:00, every 30 minutes.",
  "error.time.full": "This time is fully booked.",
  "error.partySize.required": "Choose the party size.",
  "error.partySize.range": "Party size is 1 to 8.",
  "error.seat.required": "Choose a seat.",
  "error.seat.counter": "Counter seats are for up to 2 people.",
  "error.seat.private": "Private rooms are for 4 or more people.",
  "error.couponCode.format": "Use half-width uppercase letters and digits.",
  "error.couponCode.unknown": "This coupon code can't be used.",
  "completed.title": "Reservation received (number {number})",
  "completed.summary": "{date} {time}, party of {count}, {seat}",
  "completed.coupon": "Coupon {code} (one free drink)",
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

export function isMessageKey(key: string): key is MessageKey {
  return key in ja;
}

/** `{name}` を `values` で置き換える */
export type Translate = (
  key: MessageKey,
  values?: Record<string, string | number>,
) => string;

export function createTranslate(language: Language): Translate {
  return (key, values = {}) =>
    messages[language][key].replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
}
