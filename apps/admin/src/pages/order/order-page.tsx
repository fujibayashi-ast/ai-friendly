import { Button } from "@ai-friendly/ui";
import { Link, useParams } from "react-router";
import {
  findOrder,
  itemName,
  itemSubtotal,
  orderTotal,
} from "../../admin/admin";
import { useAdmin } from "../../admin/admin-context";
import { formatDate, formatPrice } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { ordersPath } from "../../routes/paths";
import { StatusBadge } from "../status-badge";

export function OrderPage() {
  const { language, t } = useI18n();
  const { state, markShipped } = useAdmin();
  const { id = "" } = useParams();
  const order = findOrder(state, id);

  const handleShip = () => {
    markShipped(id);
  };

  const back = (
    <Link to={ordersPath()} className="text-sm underline underline-offset-4">
      {t("order.back")}
    </Link>
  );

  if (!order) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <p>{t("order.notFound", { id })}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {back}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("order.title", { id: order.id })}
        </h1>
        <StatusBadge status={order.status} />
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
        <dt className="text-muted-foreground">{t("orders.date")}</dt>
        <dd className="tabular-nums">{formatDate(language, order.date)}</dd>
        <dt className="text-muted-foreground">{t("orders.customer")}</dt>
        <dd>{order.customer[language]}</dd>
      </dl>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left whitespace-nowrap text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">{t("order.items")}</th>
              <th className="px-3 py-2 text-right font-medium">
                {t("order.quantity")}
              </th>
              <th className="px-3 py-2 text-right font-medium">
                {t("order.subtotal")}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-t">
                <td className="px-3 py-2">
                  {itemName(state, item.productId, language)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {item.quantity}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatPrice(language, itemSubtotal(state, item))}
                </td>
              </tr>
            ))}
            <tr className="border-t font-medium">
              <td className="px-3 py-2" colSpan={2}>
                {t("orders.total")}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {formatPrice(language, orderTotal(state, order))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {order.status === "pending" && (
        <div>
          <Button onClick={handleShip}>{t("order.ship")}</Button>
        </div>
      )}
    </div>
  );
}
