import { describe, expect, test } from "bun:test";
import {
  addToCart,
  addToCartError,
  cartTotal,
  completeOrder,
  initialShopState,
  orderError,
  productStatus,
  removeFromCart,
  removeFromCartError,
  setCartQuantity,
  setCartQuantityError,
  setCategory,
  setOrder,
  startOrder,
  visibleProducts,
} from "./shop";

const ids = (state = initialShopState) =>
  visibleProducts(state).map((product) => product.id);

describe("products", () => {
  test("filter by category and sort by price", () => {
    const food = setCategory(initialShopState, "food");
    expect(ids(food)).toEqual(["1", "3", "6"]);
    expect(ids(setOrder(food, "price_asc"))).toEqual(["1", "6", "3"]);
    expect(ids(setOrder(food, "price_desc"))).toEqual(["3", "6", "1"]);
    expect(ids(setOrder(food, "recommended"))).toEqual(["1", "3", "6"]);
  });

  test("status comes from the stock and the release date", () => {
    const [coffee, , cookies, , pen] = initialShopState.products;
    expect(coffee && productStatus(coffee)).toBe("available");
    expect(cookies && productStatus(cookies)).toBe("sold_out");
    expect(pen && productStatus(pen)).toBe("coming_soon");
  });
});

describe("cart", () => {
  test("add up to the stock, and refuse more", () => {
    const state = addToCart(initialShopState, "6", 1);
    expect(addToCartError(state, "6", 2)).toEqual({
      code: "over_stock",
      stock: 2,
    });
    expect(addToCart(state, "6", 2)).toBe(state);
    expect(addToCart(state, "6", 1).cart).toEqual([
      { productId: "6", quantity: 2 },
    ]);
  });

  test("refuse products that are not on sale", () => {
    expect(addToCartError(initialShopState, "3", 1)).toEqual({
      code: "sold_out",
    });
    expect(addToCartError(initialShopState, "5", 1)).toEqual({
      code: "coming_soon",
      releaseDate: "2026-11-20",
    });
    expect(addToCartError(initialShopState, "9", 1)).toEqual({
      code: "not_found",
    });
    expect(addToCart(initialShopState, "3", 1)).toBe(initialShopState);
  });

  test("set the quantity between 1 and the stock, and remove", () => {
    let state = addToCart(initialShopState, "6", 1);
    expect(setCartQuantity(state, "6", 2).cart[0]?.quantity).toBe(2);
    expect(setCartQuantityError(state, "6", 9)).toEqual({
      code: "over_stock",
      stock: 2,
    });
    expect(setCartQuantityError(state, "6", 0)).toEqual({
      code: "invalid_quantity",
    });
    expect(setCartQuantityError(state, "1", 1)).toEqual({
      code: "not_in_cart",
    });
    expect(removeFromCartError(state, "1")).toEqual({ code: "not_in_cart" });
    state = removeFromCart(state, "6");
    expect(state.cart).toEqual([]);
    expect(orderError(state)).toEqual({ code: "empty_cart" });
  });

  test("keep the cart while an order is being placed", () => {
    const state = startOrder(addToCart(initialShopState, "6", 1));
    expect(addToCart(state, "1", 1)).toBe(state);
    expect(setCartQuantity(state, "6", 2)).toBe(state);
    expect(removeFromCart(state, "6")).toBe(state);
    expect(orderError(state)).toEqual({ code: "ordering" });
  });

  test("total and order", () => {
    let state = addToCart(initialShopState, "1", 2);
    state = addToCart(state, "6", 2);
    expect(cartTotal(state)).toBe(1280 * 2 + 1680 * 2);
    state = completeOrder(state, state.cart);
    expect(state.cart).toEqual([]);
    expect(state.ordering).toBe(false);
    const honey = state.products.find((product) => product.id === "6");
    expect(honey && productStatus(honey)).toBe("sold_out");
  });
});
