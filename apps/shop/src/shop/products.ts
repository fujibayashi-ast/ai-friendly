import type { Language } from "../i18n/messages";

export const categories = ["food", "kitchen", "stationery"] as const;
export type Category = (typeof categories)[number];

export type Product = {
  id: string;
  name: Record<Language, string>;
  category: Category;
  price: number;
  stock: number;
  /** 発売前の商品だけ持つ（YYYY-MM-DD） */
  releaseDate?: string;
};

/** ダミーの商品。並びがおすすめ順 */
export const initialProducts: readonly Product[] = [
  {
    id: "1",
    name: { ja: "ドリップコーヒー（10 袋）", en: "Drip coffee (10 bags)" },
    category: "food",
    price: 1280,
    stock: 12,
  },
  {
    id: "2",
    name: { ja: "マグカップ", en: "Mug" },
    category: "kitchen",
    price: 1800,
    stock: 8,
  },
  {
    id: "3",
    name: { ja: "クッキー缶", en: "Cookie tin" },
    category: "food",
    price: 2400,
    stock: 0,
  },
  {
    id: "4",
    name: { ja: "A5 ノート", en: "A5 notebook" },
    category: "stationery",
    price: 480,
    stock: 30,
  },
  {
    id: "5",
    name: { ja: "万年筆", en: "Fountain pen" },
    category: "stationery",
    price: 4500,
    stock: 0,
    releaseDate: "2026-11-20",
  },
  {
    id: "6",
    name: { ja: "はちみつ", en: "Honey" },
    category: "food",
    price: 1680,
    stock: 2,
  },
  {
    id: "7",
    name: { ja: "木のまな板", en: "Wooden cutting board" },
    category: "kitchen",
    price: 3200,
    stock: 5,
  },
  {
    id: "8",
    name: { ja: "ガラスの保存びん", en: "Glass jar" },
    category: "kitchen",
    price: 980,
    stock: 20,
  },
];
