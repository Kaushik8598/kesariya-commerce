"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { reviewService } from "@/services/review.service";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingStars } from "@/components/ui/rating-stars";
import type { Review, ReviewsResponse } from "@/types/product";

interface ProductReviewsProps {
  slug: string;
}

export function ProductReviews({ slug }: ProductReviewsProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    reviewService
      .getReviews(slug, { limit: 5 })
      .then((res) => {
        if (mounted) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-6 py-10 border-t border-border mt-10">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="py-10 border-t border-border mt-10">
        <EmptyState
          icon={MessageSquare}
          title="No Reviews Yet"
          description="Be the first to review this product."
        />
      </div>
    );
  }

  return (
    <div className="py-10 border-t border-border mt-10">
      <h3 className="text-xl font-bold mb-8">Customer Reviews</h3>
      
      {/* Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-border/50">
        <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-2xl min-w-[160px]">
          <span className="text-4xl font-extrabold text-foreground">
            {data.avgRating.toFixed(1)}
          </span>
          <div className="my-2">
            <RatingStars rating={data.avgRating} count={0} />
          </div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            {data.totalReviews} Reviews
          </span>
        </div>
        
        <div className="flex-1 w-full space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const item = data.ratingBreakdown.find((r) => r.star === star);
            const count = item ? item.count : 0;
            const percentage = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="font-medium">{star}</span>
                  <Star className="size-3 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-10 text-right text-muted-foreground text-xs">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-8">
        {data.reviews.map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">
                  {review.user.firstName} {review.user.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={review.rating} count={0} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {review.isVerified && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {review.title && (
              <h4 className="font-bold text-sm text-foreground">{review.title}</h4>
            )}
            
            {review.comment && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
