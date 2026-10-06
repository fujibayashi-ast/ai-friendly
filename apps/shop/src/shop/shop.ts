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
  /** 注文の送信中。この間はカートを変えない */
  ordering: boolean;
};

export const initialShopState: ShopState = {
  products: initialProducts,
  category: "all",
  order: "recommended",
  cart: [],
  ordering: false,
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

/** カートと注文ができない理由。画面と AI のどちらから呼ばれても、同じ判定で断る */
export type ShopError =
  | { code: "ordering" }
  | { code: "not_found" }
  | { code: "coming_soon"; releaseDate: string }
  | { code: "sold_out" }
  | { code: "over_stock"; stock: number }
  | { code: "not_in_cart" }
  | { code: "invalid_quantity" }
  | { code: "empty_cart" };

/** 注文の送信中・売り切れなどで、その数を入れられないときの理由 */
function stockError(
  state: ShopState,
  id: string,
  quantity: number,
): ShopError | undefined {
  if (state.ordering) return { code: "ordering" };
  const product = findProduct(state, id);
  if (!product) return { code: "not_found" };
  const status = productStatus(product);
  if (status === "coming_soon") {
    return { code: "coming_soon", releaseDate: product.releaseDate ?? "" };
  }
  if (status === "sold_out") return { code: "sold_out" };
  if (quantity < 1) return { code: "invalid_quantity" };
  if (quantity > product.stock) {
    return { code: "over_stock", stock: product.stock };
  }
}

/** 販売中の商品だけ、カートの分と合わせて在庫まで入れられる */
export function addToCartError(
  state: ShopState,
  id: string,
  quantity: number,
): ShopError | undefined {
  if (quantity < 1) return { code: "invalid_quantity" };
  return stockError(state, id, cartQuantity(state, id) + quantity);
}

/** カートにある商品だけ、1 から在庫までにできる */
export function setCartQuantityError(
  state: ShopState,
  id: string,
  quantity: number,
): ShopError | undefined {
  if (state.ordering) return { code: "ordering" };
  if (cartQuantity(state, id) === 0) return { code: "not_in_cart" };
  return stockError(state, id, quantity);
}

export function removeFromCartError(
  state: ShopState,
  id: string,
): ShopError | undefined {
  if (state.ordering) return { code: "ordering" };
  if (cartQuantity(state, id) === 0) return { code: "not_in_cart" };
}

export function orderError(state: ShopState): ShopError | undefined {
  if (state.ordering) return { code: "ordering" };
  if (state.cart.length === 0) return { code: "empty_cart" };
}

export function addToCart(
  state: ShopState,
  id: string,
  quantity: number,
): ShopState {
  if (addToCartError(state, id, quantity)) return state;
  const next = cartQuantity(state, id) + quantity;
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

export function setCartQuantity(
  state: ShopState,
  id: string,
  quantity: number,
): ShopState {
  if (setCartQuantityError(state, id, quantity)) return state;
  return {
    ...state,
    cart: state.cart.map((item) =>
      item.productId === id ? { ...item, quantity } : item,
    ),
  };
}

export function removeFromCart(state: ShopState, id: string): ShopState {
  if (removeFromCartError(state, id)) return state;
  return {
    ...state,
    cart: state.cart.filter((item) => item.productId !== id),
  };
}

export function startOrder(state: ShopState): ShopState {
  return { ...state, ordering: true };
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
    ordering: false,
  };
}
