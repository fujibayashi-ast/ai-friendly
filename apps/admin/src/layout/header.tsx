import { Link } from "react-router";
import { useI18n } from "../i18n/use-i18n";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-semibold whitespace-nowrap"
        >
          <span
            aria-hidden
            className="size-5 shrink-0 rounded-[5px] bg-primary"
          />
          {t("siteName")}
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
