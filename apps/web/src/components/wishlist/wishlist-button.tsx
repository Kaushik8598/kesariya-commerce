"use client";

import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWishlist, useToggleWishlist } from "@/hooks/wishlist/use-wishlist";
import { useAuth } from "@/providers/auth-provider";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();
  const { mutate, isPending } = useToggleWishlist();

  // Do not render the button for guests per user request
  if (!authLoading && !isAuthenticated) return null;

  const isWishlisted = Array.isArray(wishlist) && wishlist.some(p => p.id === productId);
  const isLoading = authLoading || (isAuthenticated && wishlistLoading);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutate(productId);
      }}
      disabled={isPending || isLoading}
      className={cn(
        "rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-md cursor-pointer disabled:opacity-50 disabled:hover:scale-100 border-none h-8 w-8",
        isWishlisted && "bg-primary/10",
        className,
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {(isPending || isLoading) ? (
        <Loader2 className="size-4 animate-spin text-foreground/60" />
      ) : (
        <Heart
          className={cn(
            "size-4 transition-colors duration-300",
            isWishlisted
              ? "fill-primary text-primary"
              : "text-foreground/60 hover:text-primary",
          )}
        />
      )}
    </Button>
  );
}
