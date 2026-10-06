import { Button } from "@ai-friendly/ui";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import type { Product } from "../../shop/products";
import { useShop } from "../../shop/shop-context";

export function CartLine({
  product,
  quantity,
}: {
  product: Product;
  quantity: number;
}) {
  const { language, t } = useI18n();
  const { state, setCartQuantity, removeFromCart } = useShop();
  const { ordering } = state;
  const name = product.name[language];

  const handleDecrease = () => {
    setCartQuantity(product.id, quantity - 1);
  };

  const handleIncrease = () => {
    setCartQuantity(product.id, quantity + 1);
  };

  const handleRemove = () => {
    removeFromCart(product.id);
  };

  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm">{name}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("cart.remove", { name })}
          disabled={ordering}
          onClick={handleRemove}
          className="text-muted-foreground"
        >
          <Trash2 aria-hidden />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            aria-label={t("cart.decrease", { name })}
            disabled={ordering || quantity <= 1}
            onClick={handleDecrease}
          >
            <Minus aria-hidden />
          </Button>
          <span className="min-w-5 text-center text-sm tabular-nums">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label={t("cart.increase", { name })}
            disabled={ordering || quantity >= product.stock}
            onClick={handleIncrease}
          >
            <Plus aria-hidden />
          </Button>
        </div>
        <span className="text-sm tabular-nums">
          {formatPrice(language, product.price * quantity)}
        </span>
      </div>
    </li>
  );
}
