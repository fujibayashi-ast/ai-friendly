import { useI18n } from "../../i18n/use-i18n";

export function HomePage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
    </main>
  );
}
