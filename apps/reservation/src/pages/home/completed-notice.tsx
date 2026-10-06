import { formatDate } from "../../i18n/format";
import { isMessageKey } from "../../i18n/messages";
import { useI18n } from "../../i18n/use-i18n";
import { useReservation } from "../../reservation/reservation-context";

/** 直前に受け付けた予約 */
export function CompletedNotice() {
  const { language, t } = useI18n();
  const { completed } = useReservation();
  const seatLabel = (seat: string) => {
    const key = `seat.${seat}`;
    return isMessageKey(key) ? t(key) : seat;
  };
  return (
    <div role="status" className="empty:hidden">
      {completed && (
        <div className="flex flex-col gap-1 rounded-lg bg-primary/15 px-4 py-3 text-sm">
          <p className="font-medium">
            {t("completed.title", { number: completed.number })}
          </p>
          <p>
            {t("completed.summary", {
              date: formatDate(language, completed.values.date),
              time: completed.values.time,
              count: completed.values.partySize,
              seat: seatLabel(completed.values.seat),
            })}
          </p>
          {completed.values.couponCode && (
            <p>
              {t("completed.coupon", { code: completed.values.couponCode })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
