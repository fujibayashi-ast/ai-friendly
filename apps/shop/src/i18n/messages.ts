export const languages = ["ja", "en"] as const;
export type Language = (typeof languages)[number];

const ja = {
  siteName: "くらしの店",
  heading: "商品一覧",
  "language.label": "言語",
  "category.label": "カテゴリ",
  "category.all": "すべて",
  "category.food": "食品",
  "category.kitchen": "キッチン",
  "category.stationery": "文房具",
  "sort.label": "並べ替え",
  "sort.recommended": "おすすめ順",
  "sort.price_asc": "価格の安い順",
  "sort.price_desc": "価格の高い順",
  "product.add": "カートに入れる",
  "product.addLabel": "「{name}」をカートに入れる",
  "product.lowStock": "残り {count} 点",
  "product.soldOut": "売り切れ",
  "product.comingSoon": "{date} 発売予定",
  "product.limit": "在庫の上限です",
  "cart.title": "カート",
  "cart.empty": "カートは空です。",
  "cart.decrease": "「{name}」を 1 つ減らす",
  "cart.increase": "「{name}」を 1 つ増やす",
  "cart.remove": "「{name}」をカートから削除",
  "cart.total": "合計",
  "cart.order": "注文する",
  "cart.ordering": "注文しています…",
  "cart.ordered": "注文しました（注文番号 {number}）",
};

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  siteName: "Daily Goods",
  heading: "Products",
  "language.label": "Language",
  "category.label": "Category",
  "category.all": "All",
  "category.food": "Food",
  "category.kitchen": "Kitchen",
  "category.stationery": "Stationery",
  "sort.label": "Sort",
  "sort.recommended": "Recommended",
  "sort.price_asc": "Price: low to high",
  "sort.price_desc": "Price: high to low",
  "product.add": "Add to cart",
  "product.addLabel": 'Add "{name}" to cart',
  "product.lowStock": "Only {count} left",
  "product.soldOut": "Sold out",
  "product.comingSoon": "Available {date}",
  "product.limit": "No more in stock",
  "cart.title": "Cart",
  "cart.empty": "Your cart is empty.",
  "cart.decrease": 'Remove one "{name}"',
  "cart.increase": 'Add one more "{name}"',
  "cart.remove": 'Remove "{name}" from cart',
  "cart.total": "Total",
  "cart.order": "Place order",
  "cart.ordering": "Placing order…",
  "cart.ordered": "Order placed (order number {number})",
};

export const messages: Record<Language, Record<MessageKey, string>> = {
  ja,
  en,
};

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
