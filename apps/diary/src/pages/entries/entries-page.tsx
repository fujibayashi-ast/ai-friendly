import { buttonVariants } from "@ai-friendly/ui";
import { Link } from "react-router";
import { sortEntries } from "../../diary/diary";
import { useDiary } from "../../diary/diary-context";
import { useI18n } from "../../i18n/use-i18n";
import { EntryItem } from "./entry-item";

export function EntriesPage() {
  const { t } = useI18n();
  const { entries } = useDiary();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("entries.title")}
        </h1>
        <Link to="/new" className={buttonVariants()}>
          {t("entries.write")}
        </Link>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("entries.empty")}</p>
      ) : (
        <ul className="flex flex-col divide-y border-y">
          {sortEntries(entries).map((entry) => (
            <EntryItem key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}
