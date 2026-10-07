import { Button, Input } from "@ai-friendly/ui";
import { type FormEvent, useId, useState } from "react";
import { useNavigate } from "react-router";
import { maxStock, type ProductFilters } from "../../admin/admin";
import { useI18n } from "../../i18n/use-i18n";
import { productsPath } from "../../routes/paths";

/** 在庫での絞り込み。URL に入れる（戻る・再読み込みで保たれる） */
export function StockFilterForm({ filters }: { filters: ProductFilters }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const id = useId();
  const [value, setValue] = useState(filters.maxStock?.toString() ?? "");

  const handleChange = (event: FormEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(
      productsPath({ maxStock: value === "" ? undefined : Number(value) }),
    );
  };

  const handleClear = () => {
    navigate(productsPath());
  };

  return (
    <form
      className="flex flex-wrap items-center gap-2 text-sm"
      onSubmit={handleSubmit}
    >
      <label htmlFor={id}>{t("products.filter")}</label>
      <Input
        id={id}
        type="number"
        min={0}
        max={maxStock}
        value={value}
        onChange={handleChange}
        className="h-8 w-20 tabular-nums"
      />
      <span>{t("products.filterSuffix")}</span>
      <Button type="submit" size="sm" variant="outline">
        {t("products.filterButton")}
      </Button>
      {filters.maxStock !== undefined && (
        <Button type="button" size="sm" variant="ghost" onClick={handleClear}>
          {t("products.clear")}
        </Button>
      )}
    </form>
  );
}
