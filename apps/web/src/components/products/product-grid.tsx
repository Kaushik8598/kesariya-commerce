"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useProducts } from "@/hooks/products/use-products";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFiltersSidebar } from "./product-filters";
import { ProductSort } from "./product-sort";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag } from "lucide-react";

interface ProductGridProps {
  categorySlug?: string;
}

export function ProductGrid({ categorySlug }: ProductGridProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse query params
  const page = Number(searchParams.get("page")) || 1;
  const categoryParam = searchParams.get("category") || undefined;
  const brand = searchParams.get("brand") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const q = searchParams.get("q") || undefined;

  const activeCategory = categorySlug || categoryParam;

  const { data, loading, error } = useProducts({
    page,
    limit: 12,
    category: activeCategory,
    brand,
    sort,
    q,
  });

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(pathname + "?" + params.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, router, searchParams]);

  if (error) {
    return (
      <div className="py-20 text-center text-destructive">
        Failed to load products. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start relative">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24 max-md:hidden">
        {loading && !data ? (
          <ProductFiltersSidebar filters={{ categories: [], brands: [], priceRange: { min: 0, max: 0 } }} loading={true} />
        ) : data ? (
          <ProductFiltersSidebar filters={data.filters} loading={false} />
        ) : null}
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0">
        {/* Top Bar: Results Count & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-border">
          <div>
            {loading && !data ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                Showing <span className="font-bold text-foreground">{data?.products.length}</span> of{" "}
                <span className="font-bold text-foreground">{data?.pagination.total}</span> products
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ProductSort />
          </div>
        </div>

        {/* Grid */}
        {loading && !data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : data?.products.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No products found"
            description="We couldn't find any products matching your filters."
            actionLabel="Clear Filters"
            actionHref={categorySlug ? `/category/${categorySlug}` : "/products"}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {data?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
