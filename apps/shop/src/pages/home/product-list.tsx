import { visibleProducts } from "../../shop/shop";
import { useShop } from "../../shop/shop-context";
import { ProductCard } from "./product-card";

export function ProductList() {
  const { state } = useShop();
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
      {visibleProducts(state).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ul>
  );
}
