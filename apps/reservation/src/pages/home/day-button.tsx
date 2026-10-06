import { cn } from "@ai-friendly/ui";
import { formatDate, formatWeekday } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { type DayStatus, dayStatus } from "../../reservation/availability";
import { useReservation } from "../../reservation/reservation-context";

const marks: Record<DayStatus, string> = {
  available: "○",
  few: "△",
  full: "×",
  closed: "休",
};

/** カレンダーの 1 日。押すとフォームの日付に入る */
export function DayButton({ date }: { date: string }) {
  const { language, t } = useI18n();
  const { state, today, updateForm } = useReservation();
  const status = dayStatus(date);
  const past = date < today;
  const selectable = !past && (status === "available" || status === "few");
  const selected = state.form.date === date;

  const handleClick = () => {
    updateForm({ date });
  };

  return (
    <li>
      <button
        type="button"
        disabled={!selectable || state.submitting}
        aria-pressed={selected}
        aria-label={t("calendar.day", {
          date: formatDate(language, date),
          status: t(`status.${status}`),
        })}
        onClick={handleClick}
        className={cn(
          "flex w-full flex-col items-center gap-0.5 rounded-lg border py-2 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:text-muted-foreground disabled:opacity-60",
          selectable && "hover:bg-accent",
          selected && "border-primary bg-primary/15",
        )}
      >
        <span className="text-xs">{formatWeekday(language, date)}</span>
        <span className="font-medium tabular-nums">
          {date.slice(8).replace(/^0/, "")}
        </span>
        <span aria-hidden>{past ? "–" : marks[status]}</span>
      </button>
    </li>
  );
}
