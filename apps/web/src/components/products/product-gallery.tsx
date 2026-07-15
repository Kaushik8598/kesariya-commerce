"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded-2xl bg-secondary flex items-center justify-center">
        <span className="text-muted-foreground text-sm uppercase tracking-widest">No Image</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:h-[800px]">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-2 lg:pb-0 shrink-0">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative size-20 sm:size-24 lg:size-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300",
              selectedIndex === index
                ? "border-primary"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={image.url}
              alt={image.alt || `${productName} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="112px"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-secondary aspect-[3/4] lg:aspect-auto">
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt || `${productName} image ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out hover:scale-105"
        />
      </div>
    </div>
  );
}
