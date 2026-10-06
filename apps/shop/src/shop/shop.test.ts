import { describe, expect, test } from "bun:test";
import {
  addToCart,
  cartTotal,
  completeOrder,
  initialShopState,
  productStatus,
  removeFromCart,
  setCartQuantity,
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
  test("add up to the stock", () => {
    let state = addToCart(initialShopState, "6", 1);
    state = addToCart(state, "6", 5);
    expect(state.cart).toEqual([{ productId: "6", quantity: 2 }]);
  });

  test("ignore products that are not on sale", () => {
    const state = addToCart(addToCart(initialShopState, "3", 1), "5", 1);
    expect(state.cart).toEqual([]);
  });

  test("set the quantity between 1 and the stock, and remove", () => {
    let state = addToCart(initialShopState, "6", 1);
    expect(setCartQuantity(state, "6", 9).cart[0]?.quantity).toBe(2);
    expect(setCartQuantity(state, "6", 0).cart[0]?.quantity).toBe(1);
    state = removeFromCart(state, "6");
    expect(state.cart).toEqual([]);
  });

  test("keep the cart while an order is being placed", () => {
    const state = startOrder(addToCart(initialShopState, "6", 1));
    expect(addToCart(state, "1", 1)).toBe(state);
    expect(setCartQuantity(state, "6", 2)).toBe(state);
    expect(removeFromCart(state, "6")).toBe(state);
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
