import { useI18n } from "../../i18n/use-i18n";
import { Cart } from "./cart";
import { ProductFilters } from "./product-filters";
import { ProductList } from "./product-list";

export function HomePage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1fr_300px] lg:items-start">
      <section className="flex min-w-0 flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
        <ProductFilters />
        <ProductList />
      </section>
      <Cart />
    </main>
  );
}
