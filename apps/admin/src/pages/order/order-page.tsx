import { useI18n } from "../../i18n/use-i18n";

export function OrderPage() {
  const { t } = useI18n();
  return (
    <h1 className="text-2xl font-bold tracking-tight">{t("order.title")}</h1>
  );
}
