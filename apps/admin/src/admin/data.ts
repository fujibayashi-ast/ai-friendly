import type { Language } from "../i18n/messages";

export type Product = {
  id: number;
  name: Record<Language, string>;
  price: number;
  stock: number;
};

export type OrderStatus = "pending" | "shipped";

export type OrderItem = { productId: number; quantity: number };

export type Order = {
  /** 注文番号 */
  id: number;
  /** YYYY-MM-DD */
  date: string;
  /** ダミーの名前 */
  customer: Record<Language, string>;
  items: readonly OrderItem[];
  status: OrderStatus;
};

export const initialProducts: readonly Product[] = [
  {
    id: 1,
    name: { ja: "ドリップコーヒー（10 袋）", en: "Drip coffee (10 bags)" },
    price: 1280,
    stock: 12,
  },
  { id: 2, name: { ja: "マグカップ", en: "Mug" }, price: 1800, stock: 8 },
  {
    id: 3,
    name: { ja: "クッキー缶", en: "Cookie tin" },
    price: 2400,
    stock: 0,
  },
  {
    id: 4,
    name: { ja: "A5 ノート", en: "A5 notebook" },
    price: 480,
    stock: 30,
  },
  {
    id: 5,
    name: { ja: "万年筆", en: "Fountain pen" },
    price: 5800,
    stock: 3,
  },
  { id: 6, name: { ja: "はちみつ", en: "Honey" }, price: 1680, stock: 2 },
  {
    id: 7,
    name: { ja: "木のまな板", en: "Wooden cutting board" },
    price: 3200,
    stock: 5,
  },
  {
    id: 8,
    name: { ja: "ガラスの保存びん", en: "Glass jar" },
    price: 980,
    stock: 15,
  },
  {
    id: 9,
    name: { ja: "紅茶（20 包）", en: "Black tea (20 bags)" },
    price: 1100,
    stock: 9,
  },
  {
    id: 10,
    name: { ja: "布巾 3 枚組", en: "Dish cloths (set of 3)" },
    price: 760,
    stock: 4,
  },
  {
    id: 11,
    name: { ja: "鉛筆 6 本組", en: "Pencils (set of 6)" },
    price: 540,
    stock: 22,
  },
  {
    id: 12,
    name: { ja: "オリーブオイル", en: "Olive oil" },
    price: 2100,
    stock: 1,
  },
];

const customers: readonly Record<Language, string>[] = [
  { ja: "佐藤 花子", en: "Hanako Sato" },
  { ja: "鈴木 一郎", en: "Ichiro Suzuki" },
  { ja: "高橋 美咲", en: "Misaki Takahashi" },
  { ja: "田中 健", en: "Ken Tanaka" },
  { ja: "伊藤 さくら", en: "Sakura Ito" },
  { ja: "渡辺 翔", en: "Sho Watanabe" },
  { ja: "山本 結衣", en: "Yui Yamamoto" },
  { ja: "中村 大輔", en: "Daisuke Nakamura" },
  { ja: "小林 葵", en: "Aoi Kobayashi" },
  { ja: "加藤 陽太", en: "Yota Kato" },
];

/** ダミーの注文 30 件（2026-09-08 から 1 日 1 件。新しいものと、いくつかの古いものが未発送） */
export const initialOrders: readonly Order[] = Array.from(
  { length: 30 },
  (_, i): Order => {
    const items: OrderItem[] = [
      { productId: (i % 12) + 1, quantity: (i % 3) + 1 },
    ];
    if (i % 3 === 0)
      items.push({ productId: ((i * 5 + 3) % 12) + 1, quantity: 1 });
    return {
      id: 1001 + i,
      date: new Date(Date.UTC(2026, 8, 8 + i)).toISOString().slice(0, 10),
      customer: customers[(i * 7) % customers.length] ?? { ja: "", en: "" },
      items,
      status: i >= 24 || i % 9 === 4 ? "pending" : "shipped",
    };
  },
);
