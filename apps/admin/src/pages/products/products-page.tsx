import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { productsQuery } from "../../admin/queries";
import { useI18n } from "../../i18n/use-i18n";
import { readProductFilters } from "../../routes/paths";
import { ProductRow } from "./product-row";
import { StockFilterForm } from "./stock-filter-form";

export function ProductsPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const filters = readProductFilters(params);
  const {
    data: products,
    isPending,
    isError,
  } = useQuery(productsQuery(filters));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("products.title")}
      </h1>
      <StockFilterForm key={params.toString()} filters={filters} />
      {isPending ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : isError ? (
        <p className="text-sm text-destructive">{t("loadError")}</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("products.empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left whitespace-nowrap text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("products.id")}</th>
                <th className="px-3 py-2 font-medium">{t("products.name")}</th>
                <th className="px-3 py-2 text-right font-medium">
                  {t("products.price")}
                </th>
                <th className="px-3 py-2 font-medium">{t("products.stock")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
