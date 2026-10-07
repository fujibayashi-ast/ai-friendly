import { cn } from "@ai-friendly/ui";
import type { OrderStatus } from "../admin/data";
import { useI18n } from "../i18n/use-i18n";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        status === "pending"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {t(`orders.status.${status}`)}
    </span>
  );
}
