"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useInView } from "@/hooks/use-in-view";
import { categories } from "@/constants/mock-data";

export function CategoriesGrid() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div
        className={`text-center transition-all duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          Browse By Category
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Shop Our Collections
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Discover our curated categories of premium handcrafted fashion
        </p>
      </div>

      {/* Categories Grid */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`group relative overflow-hidden rounded-2xl transition-all duration-700 ${
              isInView
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            } ${index === 0 || index === 3 ? "row-span-2 aspect-auto sm:aspect-[3/4]" : "aspect-[4/3]"}`}
            style={{
              transitionDelay: isInView ? `${index * 100 + 200}ms` : "0ms",
            }}
          >
            {/* Image */}
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80 group-hover:via-black/30" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
              <div className="transition-transform duration-500 group-hover:-translate-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">
                  {category.productCount} Products
                </p>
                <h3 className="mt-1 text-lg font-extrabold tracking-wide text-white sm:text-xl">
                  {category.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-white/60">
                  {category.description}
                </p>
              </div>

              {/* Arrow Icon (visible on hover) */}
              <div className="mt-3 flex items-center gap-1.5 text-white/0 transition-all duration-500 group-hover:text-white/80">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Shop Now
                </span>
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
