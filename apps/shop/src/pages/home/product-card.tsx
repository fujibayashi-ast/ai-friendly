import { Button } from "@ai-friendly/ui";
import { formatDate, formatPrice } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import type { Product } from "../../shop/products";
import { cartQuantity, lowStockLimit, productStatus } from "../../shop/shop";
import { useShop } from "../../shop/shop-context";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: Product }) {
  const { language, t } = useI18n();
  const { state, addToCart } = useShop();
  const name = product.name[language];
  const status = productStatus(product);
  // カートに入れた分を引いた、まだ入れられる数
  const remaining = product.stock - cartQuantity(state, product.id);
  const atLimit = remaining <= 0;

  const handleAdd = () => {
    addToCart(product.id, 1);
  };

  const note =
    status === "coming_soon" && product.releaseDate
      ? t("product.comingSoon", {
          date: formatDate(language, product.releaseDate),
        })
      : status === "sold_out"
        ? t("product.soldOut")
        : !atLimit && remaining <= lowStockLimit
          ? t("product.lowStock", { count: remaining })
          : null;

  return (
    <li className="flex flex-col gap-3">
      <ProductImage category={product.category} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="text-sm font-medium">{name}</h2>
        <p className="tabular-nums">{formatPrice(language, product.price)}</p>
        {note && (
          <p
            className={
              status === "available"
                ? "text-sm font-medium"
                : "text-sm text-muted-foreground"
            }
          >
            {note}
          </p>
        )}
      </div>
      {status === "available" && (
        <Button
          size="sm"
          variant="outline"
          aria-label={atLimit ? undefined : t("product.addLabel", { name })}
          disabled={atLimit || state.ordering}
          onClick={handleAdd}
        >
          {atLimit ? t("product.limit") : t("product.add")}
        </Button>
      )}
    </li>
  );
}
