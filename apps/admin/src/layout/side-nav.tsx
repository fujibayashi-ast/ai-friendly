import { cn } from "@ai-friendly/ui";
import { NavLink } from "react-router";
import { useI18n } from "../i18n/use-i18n";

const items = [
  { to: "/orders", label: "nav.orders" },
  { to: "/products", label: "nav.products" },
] as const;

export function SideNav() {
  const { t } = useI18n();
  return (
    <nav aria-label={t("nav.label")}>
      <ul className="flex gap-1 md:flex-col">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                  isActive && "bg-muted",
                )
              }
            >
              {t(item.label)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
