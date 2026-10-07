export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "くらしの店 管理画面",
  "language.label": "言語",
  "nav.label": "メニュー",
  "nav.orders": "注文",
  "nav.products": "商品・在庫",
  "orders.title": "注文",
  "order.title": "注文の詳細",
  "products.title": "商品・在庫",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "Daily Goods Admin",
  "language.label": "Language",
  "nav.label": "Menu",
  "nav.orders": "Orders",
  "nav.products": "Products & stock",
  "orders.title": "Orders",
  "order.title": "Order details",
  "products.title": "Products & stock",
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

export type Translate = (key: MessageKey) => string;

export function createTranslate(language: Language): Translate {
  return (key) => messages[language][key];
}
