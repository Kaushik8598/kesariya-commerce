"use client";

import { useWishlist } from "@/hooks/wishlist/use-wishlist";
import { ProductCard } from "@/components/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WishlistPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data: products, isLoading: isWishlistLoading } = useWishlist();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirectTo=/wishlist");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const isLoading = isAuthLoading || isWishlistLoading;

  if (!isAuthLoading && !isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            My Wishlist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Products you have saved for later.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="You haven't saved any items to your wishlist yet. Start shopping and add your favorite items."
            actionLabel="Start Shopping"
            actionHref="/products"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
