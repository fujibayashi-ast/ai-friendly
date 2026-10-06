export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "AI Friendly Site",
  samples: "サンプル",
  "language.label": "言語",
  "sample.settings.title": "表示の設定",
  "sample.settings.description":
    "テーマと言語を切り替えるだけの小さなサイト。リセットは確認してから行います。",
  "sample.settings.example": "ダークにして",
  "sample.tasks.title": "やることリスト",
  "sample.tasks.description":
    "やることを追加・完了・削除する小さなサイト。AI からの削除は確認してから行います。",
  "sample.tasks.example": "完了したものを消して",
  "sample.shop.title": "ネットショップ",
  "sample.shop.description":
    "商品を絞り込み・並べ替えて、カートに入れて注文する小さなお店。注文は確認してから行います。",
  "sample.shop.example": "安い順に並べて",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "AI Friendly Site",
  samples: "Samples",
  "language.label": "Language",
  "sample.settings.title": "Display settings",
  "sample.settings.description":
    "A small site that switches the theme and language. Resetting asks you first.",
  "sample.settings.example": "Switch to dark",
  "sample.tasks.title": "To-do list",
  "sample.tasks.description":
    "A small site to add, complete, and delete to-dos. Deleting from the AI asks you first.",
  "sample.tasks.example": "Clear the completed ones",
  "sample.shop.title": "Online shop",
  "sample.shop.description":
    "A small shop to filter and sort products, add them to the cart, and order. Ordering asks you first.",
  "sample.shop.example": "Sort by lowest price",
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

/** 言語名は、表示中の言語に関係なくその言語で書く */
export const languageNames: Record<Language, { short: string; name: string }> =
  {
    ja: { short: "JA", name: "日本語" },
    en: { short: "EN", name: "English" },
  };
