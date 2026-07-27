"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Star, MessageSquare, CheckCircle, Clock, ExternalLink, ShoppingBag } from "lucide-react";
import { useMyReviews } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyReviewsPage() {
  const { data, isLoading } = useMyReviews();

  if (isLoading) {
    return (
      <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
        <Skeleton className="h-8 w-44 mb-4" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const reviews = data?.data || [];

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
          <Star className="h-5 w-5 fill-primary text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading text-foreground">
            My Product Reviews ({reviews.length})
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            View all your submitted product ratings, feedback, and reviews
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-60" />
          </div>
          <h3 className="text-base font-extrabold uppercase tracking-wider font-heading text-foreground">
            No Reviews Found
          </h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            You haven't written any product reviews yet. Share your experience on items you've purchased!
          </p>
          <Link href="/products" className="mt-6">
            <Button className="gap-2 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="h-4 w-4" /> Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="border border-border rounded-xl p-5 bg-secondary/10 flex flex-col sm:flex-row gap-5 transition-all hover:border-foreground/20"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-[3/4] w-20 rounded-lg bg-secondary overflow-hidden border border-border shrink-0">
                <Image
                  src={review.product?.images?.[0]?.url || "/placeholder.jpg"}
                  alt={review.product?.name || "Product"}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Review Content */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <Link
                    href={`/products/${review.product?.slug || "#"}`}
                    className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5 line-clamp-1"
                  >
                    {review.product?.name || "Apparel Item"}
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </Link>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {format(new Date(review.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Status Badge */}
                  {review.isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                      <Clock className="h-3 w-3" /> Under Review
                    </span>
                  )}
                </div>

                {/* Review Title & Comment */}
                {review.title && (
                  <h4 className="font-extrabold text-sm text-foreground pt-1">{review.title}</h4>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
