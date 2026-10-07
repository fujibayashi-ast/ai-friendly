import { Link } from "react-router";
import type { OrderSummary } from "../../admin/admin-api";
import { formatDate, formatPrice } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { orderPath } from "../../routes/paths";
import { StatusBadge } from "../status-badge";

export function OrderRow({ order }: { order: OrderSummary }) {
  const { language } = useI18n();
  return (
    <tr className="border-t">
      <td className="px-3 py-2">
        <Link
          to={orderPath(order.id)}
          className="font-medium underline underline-offset-4"
        >
          {order.id}
        </Link>
      </td>
      <td className="px-3 py-2 whitespace-nowrap tabular-nums">
        {formatDate(language, order.date)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        {order.customer[language]}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatPrice(language, order.total)}
      </td>
      <td className="px-3 py-2">
        <StatusBadge status={order.status} />
      </td>
    </tr>
  );
}
