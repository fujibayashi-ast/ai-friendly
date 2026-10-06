import { cn } from "@ai-friendly/ui";
import { Apple, CookingPot, PenLine } from "lucide-react";
import type { Category } from "../../shop/products";

const icons = { food: Apple, kitchen: CookingPot, stationery: PenLine };

/** 商品の写真の代わり。カテゴリのアイコンを置く */
export function ProductImage({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const Icon = icons[category];
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-lg bg-muted text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-1/4" strokeWidth={1.5} />
    </div>
  );
}
