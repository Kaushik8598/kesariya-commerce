"use client";

import { cn } from "@/lib/utils";
import { useStoreSettings } from "@/providers/store-settings-provider";

interface PriceProps {
  basePrice: number;
  salePrice?: number | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showDiscountBadge?: boolean;
}

function getDiscount(base: number, sale: number): number {
  if (!base || base <= 0) return 0;
  return Math.round(((base - sale) / base) * 100);
}

export function Price({
  basePrice,
  salePrice,
  size = "sm",
  className,
  showDiscountBadge = true,
}: PriceProps) {
  const { formatPrice: formatWithCurrency } = useStoreSettings();

  const numBase = Number(basePrice) || 0;
  const numSale = salePrice !== null && salePrice !== undefined ? Number(salePrice) : null;
  const hasSale = numSale !== null && numSale < numBase;

  const textSizes = {
    xs: { price: "text-xs", original: "text-[10px]", badge: "text-[8px]" },
    sm: { price: "text-sm", original: "text-xs", badge: "text-[9px]" },
    md: { price: "text-base", original: "text-sm", badge: "text-[10px]" },
    lg: { price: "text-xl", original: "text-base", badge: "text-xs" },
    xl: { price: "text-2xl sm:text-3xl", original: "text-base sm:text-lg", badge: "text-xs" },
  };

  const sizes = textSizes[size] || textSizes.sm;

  return (
    <div className={cn("inline-flex items-center gap-2 flex-wrap", className)}>
      <span className={cn(sizes.price, "font-bold text-foreground font-heading tracking-tight")}>
        {formatWithCurrency(hasSale ? numSale! : numBase)}
      </span>
      {hasSale && (
        <>
          <span
            className={cn(
              sizes.original,
              "font-semibold text-muted-foreground line-through opacity-70",
            )}
          >
            {formatWithCurrency(numBase)}
          </span>
          {showDiscountBadge && (
            <span
              className={cn(
                sizes.badge,
                "font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider",
              )}
            >
              {getDiscount(numBase, numSale!)}% OFF
            </span>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Utility helper to format standalone prices with dynamic currency symbol
 */
export function formatPrice(amount: number, symbol = "₹"): string {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
