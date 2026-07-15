"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
      }}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-md cursor-pointer",
        isWishlisted && "bg-primary/10",
        className,
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "size-4 transition-colors duration-300",
          isWishlisted
            ? "fill-primary text-primary"
            : "text-foreground/60 hover:text-primary",
        )}
      />
    </button>
  );
}
