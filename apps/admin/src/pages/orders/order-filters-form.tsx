import { Button, Input, ToggleGroup, ToggleGroupItem } from "@ai-friendly/ui";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { type OrderFilters, orderStatuses } from "../../admin/admin";
import { useI18n } from "../../i18n/use-i18n";
import { ordersPath } from "../../routes/paths";

const statusOptions = ["all", ...orderStatuses] as const;

/** 絞り込みは URL に入れる（戻る・再読み込みで保たれる） */
export function OrderFiltersForm({ filters }: { filters: OrderFilters }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState(filters.query ?? "");

  const handleStatusChange = (value: string) => {
    // 選んでいるものを押し直すと空になるので、変えない
    if (!value) return;
    const status = orderStatuses.find((item) => item === value);
    navigate(ordersPath({ ...filters, status }));
  };

  const handleQueryChange = (event: FormEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(ordersPath({ ...filters, query }));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <ToggleGroup
        type="single"
        size="sm"
        variant="outline"
        aria-label={t("orders.status")}
        value={filters.status ?? "all"}
        onValueChange={handleStatusChange}
      >
        {statusOptions.map((status) => (
          <ToggleGroupItem key={status} value={status}>
            {t(`orders.status.${status}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <search>
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <Input
            type="search"
            aria-label={t("orders.search")}
            placeholder={t("orders.search")}
            value={query}
            onChange={handleQueryChange}
            className="sm:w-64"
          />
          <Button type="submit" variant="outline">
            {t("orders.searchButton")}
          </Button>
        </form>
      </search>
    </div>
  );
}
