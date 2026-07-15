"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { RatingStars } from "@/components/ui/rating-stars";
import { Price } from "@/components/ui/price";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800";
  
  let badge = null;
  if (product.isNewArrival) badge = "NEW";
  else if (product.isFeatured) badge = "FEATURED";

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary">
          {/* Badge */}
          {badge && (
            <span
              className={cn(
                "absolute left-3 top-3 z-10 rounded-md px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest",
                badge === "NEW"
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {badge}
            </span>
          )}

          {/* Wishlist Button */}
          <WishlistButton
            productId={product.id}
            className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* Product Image */}
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Add to Bag Overlay */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground/90 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-background backdrop-blur-sm transition-all hover:bg-primary cursor-pointer"
            >
              <ShoppingBag className="size-3.5" />
              Add to Bag
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-3.5 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {product.category?.name}
        </p>
        <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-1 transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <Price
          basePrice={product.basePrice}
          salePrice={product.salePrice}
        />
        <RatingStars rating={product.avgRating || 0} count={product._count?.reviews || 0} />
      </div>
    </div>
  );
}
