import { Button } from "@ai-friendly/ui";
import { formatPrice } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { cartTotal, findProduct } from "../../shop/shop";
import { useShop } from "../../shop/shop-context";
import { CartLine } from "./cart-line";

export function Cart() {
  const { language, t } = useI18n();
  const { state, orderNumber, placeOrder } = useShop();
  const { ordering } = state;

  const handleOrder = () => {
    void placeOrder();
  };

  return (
    <aside
      aria-labelledby="cart-title"
      className="flex flex-col gap-4 rounded-xl border p-5 lg:sticky lg:top-6"
    >
      <h2 id="cart-title" className="text-lg font-semibold">
        {t("cart.title")}
      </h2>
      <div role="status" className="empty:hidden">
        {orderNumber && (
          <p className="rounded-md bg-primary/15 px-3 py-2 text-sm">
            {t("cart.ordered", { number: orderNumber })}
          </p>
        )}
      </div>
      {state.cart.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("cart.empty")}</p>
      ) : (
        <>
          <ul className="flex flex-col divide-y">
            {state.cart.map((item) => {
              const product = findProduct(state, item.productId);
              return (
                product && (
                  <CartLine
                    key={item.productId}
                    product={product}
                    quantity={item.quantity}
                  />
                )
              );
            })}
          </ul>
          <div className="flex items-baseline justify-between border-t pt-4">
            <span className="text-sm">{t("cart.total")}</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatPrice(language, cartTotal(state))}
            </span>
          </div>
          <Button disabled={ordering} onClick={handleOrder}>
            {ordering ? t("cart.ordering") : t("cart.order")}
          </Button>
        </>
      )}
    </aside>
  );
}
