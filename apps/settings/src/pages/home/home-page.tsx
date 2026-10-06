import { useI18n } from "../../i18n/use-i18n";

export function HomePage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-20 sm:px-6 sm:py-28">
      <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        {t("heading")}
      </h1>
      <p className="mt-4 max-w-prose text-lg text-muted-foreground text-pretty">
        {t("lead")}
      </p>
    </main>
  );
}
