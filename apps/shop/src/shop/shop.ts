import { type Category, initialProducts, type Product } from "./products";

export const categoryFilters = [
  "all",
  "food",
  "kitchen",
  "stationery",
] as const;
export type CategoryFilter = "all" | Category;

export const sortOrders = ["recommended", "price_asc", "price_desc"] as const;
export type SortOrder = (typeof sortOrders)[number];

export type ProductStatus = "available" | "sold_out" | "coming_soon";

export type CartItem = { productId: string; quantity: number };

export type ShopState = {
  products: readonly Product[];
  category: CategoryFilter;
  order: SortOrder;
  cart: readonly CartItem[];
};

export const initialShopState: ShopState = {
  products: initialProducts,
  category: "all",
  order: "recommended",
  cart: [],
};

/** 在庫がこの数以下なら「残り n 点」と出す */
export const lowStockLimit = 3;

export function productStatus(product: Product): ProductStatus {
  if (product.releaseDate) return "coming_soon";
  if (product.stock === 0) return "sold_out";
  return "available";
}

export function findProduct(state: ShopState, id: string): Product | undefined {
  return state.products.find((product) => product.id === id);
}

/** 絞り込み・並べ替えをした一覧 */
export function visibleProducts(state: ShopState): Product[] {
  const filtered = state.products.filter(
    (product) =>
      state.category === "all" || product.category === state.category,
  );
  if (state.order === "recommended") return filtered;
  const sign = state.order === "price_asc" ? 1 : -1;
  return filtered.sort((a, b) => sign * (a.price - b.price));
}

export function cartQuantity(state: ShopState, id: string): number {
  return state.cart.find((item) => item.productId === id)?.quantity ?? 0;
}

export function cartTotal(state: ShopState): number {
  return state.cart.reduce(
    (sum, item) =>
      sum + (findProduct(state, item.productId)?.price ?? 0) * item.quantity,
    0,
  );
}

export function setCategory(
  state: ShopState,
  category: CategoryFilter,
): ShopState {
  return { ...state, category };
}

export function setOrder(state: ShopState, order: SortOrder): ShopState {
  return { ...state, order };
}

/** 販売中の商品だけ入れる。数はカートの分と合わせて在庫まで */
export function addToCart(
  state: ShopState,
  id: string,
  quantity: number,
): ShopState {
  const product = findProduct(state, id);
  if (!product || productStatus(product) !== "available") return state;
  const next = Math.min(cartQuantity(state, id) + quantity, product.stock);
  if (next <= 0) return state;
  const exists = state.cart.some((item) => item.productId === id);
  return {
    ...state,
    cart: exists
      ? state.cart.map((item) =>
          item.productId === id ? { ...item, quantity: next } : item,
        )
      : [...state.cart, { productId: id, quantity: next }],
  };
}

/** 1 から在庫までにそろえる */
export function setCartQuantity(
  state: ShopState,
  id: string,
  quantity: number,
): ShopState {
  const product = findProduct(state, id);
  if (!product) return state;
  const next = Math.max(1, Math.min(quantity, product.stock));
  return {
    ...state,
    cart: state.cart.map((item) =>
      item.productId === id ? { ...item, quantity: next } : item,
    ),
  };
}

export function removeFromCart(state: ShopState, id: string): ShopState {
  return {
    ...state,
    cart: state.cart.filter((item) => item.productId !== id),
  };
}

/** 注文した数だけ在庫を減らし、カートを空にする */
export function completeOrder(
  state: ShopState,
  items: readonly CartItem[],
): ShopState {
  return {
    ...state,
    products: state.products.map((product) => {
      const ordered = items.find((item) => item.productId === product.id);
      return ordered
        ? { ...product, stock: Math.max(0, product.stock - ordered.quantity) }
        : product;
    }),
    cart: [],
  };
}
