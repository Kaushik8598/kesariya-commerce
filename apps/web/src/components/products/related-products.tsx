"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/product";

interface RelatedProductsProps {
  slug: string;
  categorySlug?: string;
}

export function RelatedProducts({ slug, categorySlug }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productService
      .getRelatedProducts(slug, 4)
      .then((res) => {
        if (mounted) setProducts(res.data);
      })
      .catch((err) => {
        console.error("Failed to load related products:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row mb-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              You May Also Like
            </h2>
          </div>
          {categorySlug && (
            <Link
              href={`/category/${categorySlug}`}
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-primary"
            >
              More in this category
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
}
