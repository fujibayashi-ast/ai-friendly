import { formatDate } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { useReservation } from "../../reservation/reservation-context";

/** 直前に受け付けた予約 */
export function CompletedNotice() {
  const { language, t } = useI18n();
  const { completed } = useReservation();
  return (
    <div role="status" className="empty:hidden">
      {completed && (
        <div className="flex flex-col gap-1 rounded-lg bg-primary/15 px-4 py-3 text-sm">
          <p className="font-medium">
            {t("completed.title", { number: completed.number })}
          </p>
          <p>
            {t("completed.summary", {
              date: formatDate(language, completed.form.date),
              time: completed.form.time,
              count: completed.form.partySize ?? "",
              seat: completed.form.seat ? t(`seat.${completed.form.seat}`) : "",
            })}
          </p>
          {completed.form.couponCode && (
            <p>{t("completed.coupon", { code: completed.form.couponCode })}</p>
          )}
        </div>
      )}
    </div>
  );
}
