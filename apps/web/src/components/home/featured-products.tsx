"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useInView } from "@/hooks/use-in-view";
import { ProductCard } from "@/components/products/product-card";
import { useFeaturedProducts } from "@/hooks/products/use-products";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedProducts() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const { products, loading } = useFeaturedProducts(4);

  return (
    <section id="best-sellers" ref={ref} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div
        className={`flex flex-col items-center justify-between gap-4 sm:flex-row transition-all duration-700 ${
          isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Handpicked For You
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Featured Products
          </h2>
        </div>
        <Link
          href="/products?filter=featured"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-primary"
        >
          View All
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          : products.map((product, index) => (
              <div
                key={product.id}
                className={`transition-all duration-700 ${
                  isInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{
                  transitionDelay: isInView ? `${index * 80 + 200}ms` : "0ms",
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}
