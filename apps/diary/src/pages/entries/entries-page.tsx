import { useI18n } from "../../i18n/use-i18n";

export function EntriesPage() {
  const { t } = useI18n();
  return (
    <h1 className="text-2xl font-bold tracking-tight">{t("entries.title")}</h1>
  );
}
