"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/product";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedSize: string | null;
  selectedColor: string | null;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
}

export function VariantSelector({
  variants,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
}: VariantSelectorProps) {
  // Extract unique sizes and colors that exist across all variants
  const availableSizes = useMemo(() => {
    return Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[];
  }, [variants]);

  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    variants.forEach((v) => {
      if (v.color && v.colorCode) {
        if (!colorMap.has(v.color)) {
          colorMap.set(v.color, v.colorCode);
        }
      }
    });
    return Array.from(colorMap.entries()).map(([name, code]) => ({ name, code }));
  }, [variants]);

  // If no variants with size or color, return null
  if (availableSizes.length === 0 && availableColors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Colors */}
      {availableColors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Color
            </h4>
            <span className="text-xs text-muted-foreground">{selectedColor || "Select Color"}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => {
              const isSelected = selectedColor === color.name;
              // Optional: Check if this color is available in the currently selected size
              const isAvailable = selectedSize
                ? variants.some((v) => v.color === color.name && v.size === selectedSize && v.stock > 0)
                : variants.some((v) => v.color === color.name && v.stock > 0);

              return (
                <button
                  key={color.name}
                  onClick={() => onColorChange(color.name)}
                  className={cn(
                    "group relative size-10 rounded-full flex items-center justify-center transition-all",
                    isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:ring-2 hover:ring-border hover:ring-offset-2",
                    !isAvailable && "opacity-50"
                  )}
                  title={color.name}
                >
                  <span
                    className="absolute inset-0 rounded-full border border-black/10"
                    style={{ backgroundColor: color.code }}
                  />
                  {!isAvailable && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-[2px] w-full rotate-45 bg-foreground/50 rounded-full" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Size
            </h4>
            <button className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground underline underline-offset-4 hover:text-primary transition-colors">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              const isAvailable = selectedColor
                ? variants.some((v) => v.size === size && v.color === selectedColor && v.stock > 0)
                : variants.some((v) => v.size === size && v.stock > 0);

              return (
                <button
                  key={size}
                  onClick={() => onSizeChange(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "flex h-12 min-w-12 sm:min-w-16 items-center justify-center rounded-xl border px-3 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : isAvailable
                        ? "border-border bg-card text-foreground hover:border-primary hover:bg-secondary"
                        : "border-border/50 bg-secondary/30 text-muted-foreground/50 cursor-not-allowed"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
