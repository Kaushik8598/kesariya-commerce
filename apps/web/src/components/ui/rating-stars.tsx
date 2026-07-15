import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RatingStars({
  rating,
  count,
  size = "sm",
  className,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSize = size === "sm" ? "size-3" : "size-4";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(starSize, "fill-amber-400 text-amber-400")}
          />
        ))}
        {hasHalfStar && (
          <StarHalf
            className={cn(starSize, "fill-amber-400 text-amber-400")}
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(starSize, "text-muted-foreground/30")}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-[10px] font-semibold text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  );
}
