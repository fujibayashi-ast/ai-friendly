import { useI18n } from "../../i18n/use-i18n";
import { AvailabilityCalendar } from "./availability-calendar";
import { CompletedNotice } from "./completed-notice";
import { ReservationFormView } from "./reservation-form";

export function HomePage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
      <CompletedNotice />
      <AvailabilityCalendar />
      <ReservationFormView />
    </main>
  );
}
