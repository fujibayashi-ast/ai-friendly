import { Button } from "@ai-friendly/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { addDays, weekDates, weekStart } from "../../reservation/dates";
import { useReservation } from "../../reservation/reservation-context";
import { DayButton } from "./day-button";

export function AvailabilityCalendar() {
  const { language, t } = useI18n();
  const { weekOf, today, showWeek } = useReservation();
  const dates = weekDates(weekOf);
  const first = dates[0] ?? weekOf;
  const last = dates[6] ?? weekOf;

  const handlePrev = () => {
    showWeek(addDays(weekOf, -7));
  };

  const handleNext = () => {
    showWeek(addDays(weekOf, 7));
  };

  return (
    <section aria-labelledby="calendar-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="calendar-title" className="text-lg font-semibold">
          {t("calendar.title")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("calendar.prev")}
            disabled={weekOf <= weekStart(today)}
            onClick={handlePrev}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="min-w-36 text-center text-sm tabular-nums">
            {formatDate(language, first)} – {formatDate(language, last)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("calendar.next")}
            onClick={handleNext}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
      <ol className="grid grid-cols-7 gap-1.5">
        {dates.map((date) => (
          <DayButton key={date} date={date} />
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        ○ {t("status.available")}　△ {t("status.few")}　× {t("status.full")}　休{" "}
        {t("status.closed")}
      </p>
    </section>
  );
}
