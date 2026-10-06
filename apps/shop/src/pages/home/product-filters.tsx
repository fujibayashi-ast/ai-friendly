import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
} from "@ai-friendly/ui";
import { useI18n } from "../../i18n/use-i18n";
import { categoryFilters, sortOrders } from "../../shop/shop";
import { useShop } from "../../shop/shop-context";

export function ProductFilters() {
  const { t } = useI18n();
  const { state, setCategory, setOrder } = useShop();

  const handleCategoryChange = (value: string) => {
    const next = categoryFilters.find((item) => item === value);
    if (next) setCategory(next);
  };

  const handleOrderChange = (value: string) => {
    const next = sortOrders.find((item) => item === value);
    if (next) setOrder(next);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label={t("category.label")}
        value={state.category}
        onValueChange={handleCategoryChange}
        className="flex-wrap"
      >
        {categoryFilters.map((item) => (
          <ToggleGroupItem key={item} value={item} className="px-3">
            {t(`category.${item}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Select value={state.order} onValueChange={handleOrderChange}>
        <SelectTrigger size="sm" aria-label={t("sort.label")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {sortOrders.map((item) => (
            <SelectItem key={item} value={item}>
              {t(`sort.${item}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
