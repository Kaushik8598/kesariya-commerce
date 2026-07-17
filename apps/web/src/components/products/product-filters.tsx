"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import type { ProductFilters } from "@/types/product";

interface ProductFiltersSidebarProps {
  filters: ProductFilters;
  loading: boolean;
}

export function ProductFiltersSidebar({ filters, loading }: ProductFiltersSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentBrand = searchParams.get("brand");
  const currentRating = searchParams.get("rating");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      params.delete("page"); // Reset page when filter changes
      return params.toString();
    },
    [searchParams]
  );

  const removeQueryString = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-5 w-24 bg-secondary rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-full bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
          Categories
        </h3>
        <ul className="space-y-2.5">
          {filters.categories.map((category) => {
            const isActive = currentCategory === category.slug;
            return (
              <li key={category.slug}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push(
                      pathname +
                        "?" +
                        (isActive
                          ? removeQueryString("category")
                          : createQueryString("category", category.slug))
                    );
                  }}
                  className="group flex h-auto p-0 w-full items-center justify-between text-sm hover:bg-transparent"
                >
                  <span
                    className={cn(
                      "transition-colors font-normal",
                      isActive
                        ? "font-semibold text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full font-normal">
                    {category._count.products}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
          Brands
        </h3>
        <ul className="space-y-2.5">
          {filters.brands.map((brand) => {
            const isActive = currentBrand === brand.slug;
            return (
              <li key={brand.slug}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push(
                      pathname +
                        "?" +
                        (isActive
                          ? removeQueryString("brand")
                          : createQueryString("brand", brand.slug))
                    );
                  }}
                  className="group flex h-auto p-0 w-full items-center gap-3 text-sm hover:bg-transparent"
                >
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-transparent group-hover:border-primary"
                    )}
                  >
                    {isActive && <Check className="size-3" />}
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-left transition-colors font-normal",
                      isActive
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {brand.name}
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full font-normal">
                    {brand._count.products}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Active Filters Summary */}
      {(currentCategory || currentBrand || currentRating) && (
        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => router.push(pathname)}
            className="flex h-auto p-0 items-center text-xs font-semibold text-destructive hover:text-destructive hover:bg-transparent hover:underline"
          >
            <X className="size-3 mr-1" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
