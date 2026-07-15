import { cn } from "@/lib/utils";

interface PriceProps {
  basePrice: number;
  salePrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDiscount(base: number, sale: number): number {
  return Math.round(((base - sale) / base) * 100);
}

export function Price({ basePrice, salePrice, size = "sm", className }: PriceProps) {
  const hasSale = salePrice !== null && salePrice !== undefined && salePrice < basePrice;

  const textSizes = {
    sm: { price: "text-sm", original: "text-xs", badge: "text-[9px]" },
    md: { price: "text-base", original: "text-sm", badge: "text-[10px]" },
    lg: { price: "text-xl", original: "text-base", badge: "text-xs" },
  };

  const sizes = textSizes[size];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn(sizes.price, "font-bold text-foreground")}>
        {formatPrice(hasSale ? salePrice! : basePrice)}
      </span>
      {hasSale && (
        <>
          <span
            className={cn(
              sizes.original,
              "font-semibold text-muted-foreground line-through",
            )}
          >
            {formatPrice(basePrice)}
          </span>
          <span
            className={cn(
              sizes.badge,
              "font-bold text-emerald-600 dark:text-emerald-400",
            )}
          >
            {getDiscount(basePrice, salePrice!)}% OFF
          </span>
        </>
      )}
    </div>
  );
}

export { formatPrice };
