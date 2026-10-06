import { useI18n } from "../i18n/use-i18n";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <a
          href="/"
          aria-label={t("siteName")}
          className="flex items-center gap-2.5 font-semibold whitespace-nowrap"
        >
          <span
            aria-hidden
            className="size-5 shrink-0 rounded-[5px] bg-primary"
          />
          <span className="hidden min-[400px]:inline">{t("siteName")}</span>
        </a>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <span aria-hidden className="h-5 w-px bg-border" />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
