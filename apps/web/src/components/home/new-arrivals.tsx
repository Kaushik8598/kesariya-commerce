"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useInView } from "@/hooks/use-in-view";
import { ProductCard } from "@/components/products/product-card";
import { useNewArrivals } from "@/hooks/products/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function NewArrivals() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const { products, loading } = useNewArrivals(6);

  return (
    <section ref={ref} className="py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          {/* Section Header */}
          <div
            className={`flex flex-col items-center justify-between gap-4 sm:flex-row transition-all duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                Just Dropped
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                New Arrivals
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Shadcn Carousel Controls */}
              <div className="relative flex items-center gap-2">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 border-border bg-card text-foreground/60 hover:border-primary hover:text-primary transition-all" />
                <CarouselNext className="static translate-y-0 h-10 w-10 border-border bg-card text-foreground/60 hover:border-primary hover:text-primary transition-all" />
              </div>
              <Link
                href="/products?sort=newest"
                className="group ml-2 hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-primary sm:inline-flex"
              >
                View All
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Carousel Container */}
          <div
            className={`mt-10 transition-all duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
            style={{ transitionDelay: isInView ? "200ms" : "0ms" }}
          >
            <CarouselContent className="-ml-4 sm:-ml-6 lg:-ml-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <CarouselItem
                      key={i}
                      className="pl-4 sm:pl-6 lg:pl-6 basis-auto"
                    >
                      <div className="w-[260px] sm:w-[280px] lg:w-[300px] space-y-3">
                        <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CarouselItem>
                  ))
                : products.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="pl-4 sm:pl-6 lg:pl-6 basis-auto"
                    >
                      <div className="w-[260px] sm:w-[280px] lg:w-[300px]">
                        <ProductCard product={product} />
                      </div>
                    </CarouselItem>
                  ))}

              {/* "View All" card */}
              <CarouselItem className="pl-4 sm:pl-6 lg:pl-6 basis-auto">
                <Link
                  href="/products?sort=newest"
                  className="flex h-full w-[200px] sm:w-[240px] items-center justify-center rounded-xl border-2 border-dashed border-border transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                      <ArrowRight className="size-5 text-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
                      View All
                      <br />
                      New Arrivals
                    </span>
                  </div>
                </Link>
              </CarouselItem>
            </CarouselContent>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
