import { useSearchParams } from "react-router";
import { filterOrders } from "../../admin/admin";
import { useAdmin } from "../../admin/admin-context";
import { useI18n } from "../../i18n/use-i18n";
import { readOrderFilters } from "../../routes/paths";
import { OrderFiltersForm } from "./order-filters-form";
import { OrderRow } from "./order-row";

export function OrdersPage() {
  const { t } = useI18n();
  const { state } = useAdmin();
  const [params] = useSearchParams();
  const filters = readOrderFilters(params);
  const orders = filterOrders(state, filters);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("orders.title")}
        </h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          {t("orders.count", { count: orders.length })}
        </p>
      </div>
      <OrderFiltersForm key={params.toString()} filters={filters} />
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("orders.empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left whitespace-nowrap text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("orders.id")}</th>
                <th className="px-3 py-2 font-medium">{t("orders.date")}</th>
                <th className="px-3 py-2 font-medium">
                  {t("orders.customer")}
                </th>
                <th className="px-3 py-2 text-right font-medium">
                  {t("orders.total")}
                </th>
                <th className="px-3 py-2 font-medium">{t("orders.status")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
