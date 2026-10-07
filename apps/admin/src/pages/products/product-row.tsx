import { Button, Input } from "@ai-friendly/ui";
import { type FormEvent, useState } from "react";
import { maxStock } from "../../admin/admin";
import type { Product } from "../../admin/data";
import { useUpdateStock } from "../../admin/queries";
import { formatPrice } from "../../i18n/format";
import { useI18n } from "../../i18n/use-i18n";
import { ApiErrorMessage } from "../api-error-message";

export function ProductRow({ product }: { product: Product }) {
  const { language, t } = useI18n();
  const update = useUpdateStock();
  const [stock, setStockInput] = useState(String(product.stock));
  // AI などで在庫が変わったら、入力欄もそろえる
  const [shown, setShown] = useState(product.stock);
  if (shown !== product.stock) {
    setShown(product.stock);
    setStockInput(String(product.stock));
  }
  const name = product.name[language];

  const handleStockChange = (event: FormEvent<HTMLInputElement>) => {
    setStockInput(event.currentTarget.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    update.mutate({ id: product.id, stock: Number(stock) });
  };

  return (
    <tr className="border-t">
      <td className="px-3 py-2 tabular-nums">{product.id}</td>
      <td className="px-3 py-2">{name}</td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatPrice(language, product.price)}
      </td>
      <td className="px-3 py-2">
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <Input
            type="number"
            min={0}
            max={maxStock}
            required
            aria-label={t("products.stockLabel", { name })}
            value={stock}
            onChange={handleStockChange}
            className="h-8 w-20 tabular-nums"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={stock === String(product.stock) || update.isPending}
          >
            {t("products.save")}
          </Button>
        </form>
        <ApiErrorMessage error={update.error} />
      </td>
    </tr>
  );
}
