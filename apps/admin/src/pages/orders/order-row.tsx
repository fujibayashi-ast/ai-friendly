import { Link } from "react-router";
import { orderTotal } from "../../admin/admin";
import { useAdmin } from "../../admin/admin-context";
import type { Order } from "../../admin/data";
import { formatDate, formatPrice } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { orderPath } from "../../routes/paths";
import { StatusBadge } from "../status-badge";

export function OrderRow({ order }: { order: Order }) {
  const { language } = useI18n();
  const { state } = useAdmin();
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
        {formatPrice(language, orderTotal(state, order))}
      </td>
      <td className="px-3 py-2">
        <StatusBadge status={order.status} />
      </td>
    </tr>
  );
}
