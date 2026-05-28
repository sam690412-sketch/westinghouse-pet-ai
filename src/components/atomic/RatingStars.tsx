import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "./Typography";
import { forwardRef } from "react";

export interface RatingStarsProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const RatingStars = forwardRef<HTMLDivElement, RatingStarsProps>(
  ({ rating, maxRating = 5, reviewCount, size = "md", showValue = true, interactive = false, onRate, className, ...props }, ref) => {
    const sizeClasses = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" };
    const stars = [];

    for (let i = 1; i <= maxRating; i++) {
      const filled = rating >= i;
      const half = !filled && rating >= i - 0.5;

      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(i)}
          className={cn(
            "relative inline-flex",
            interactive && "cursor-pointer hover:scale-110 transition-transform"
          )}
          aria-label={`Rate ${i} out of ${maxRating} stars`}
        >
          {/* Background star (empty) */}
          <Star className={cn(sizeClasses[size], "text-neutral-200")} aria-hidden="true" />
          {/* Filled star overlay */}
          {filled && (
            <Star className={cn(sizeClasses[size], "absolute inset-0 fill-pet-paw text-pet-paw")} aria-hidden="true" />
          )}
          {half && (
            <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
              <Star className={cn(sizeClasses[size], "fill-pet-paw text-pet-paw")} aria-hidden="true" />
            </div>
          )}
        </button>
      );
    }

    return (
      <div ref={ref} className={cn("flex items-center gap-1.5", className)} {...props}>
        <div className="flex items-center gap-0.5" role="img" aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
          {stars}
        </div>
        {showValue && (
          <Text variant="label" weight="semibold" className="text-foreground">
            {rating.toFixed(1)}
          </Text>
        )}
        {reviewCount !== undefined && reviewCount > 0 && (
          <Text variant="caption" color="muted">
            ({reviewCount.toLocaleString("zh-TW")})
          </Text>
        )}
      </div>
    );
  }
);
RatingStars.displayName = "RatingStars";
