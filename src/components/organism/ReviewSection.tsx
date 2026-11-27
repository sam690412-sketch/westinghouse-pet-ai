import { useState } from "react";
import { Star, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ReviewCard,
  type ReviewCardProps,
} from "@/components/molecule/ReviewCard";
import { Heading, Text } from "@/components/atomic/Typography";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface ReviewSectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Review items */
  reviews: ReviewItem[];
  /** Average rating (1-5) */
  averageRating?: number;
  /** Total review count */
  totalReviews?: number;
  /** Rating distribution { 5: count, 4: count, ... } */
  ratingDistribution?: Record<number, number>;
  /** Show rating breakdown */
  showBreakdown?: boolean;
  /** Filter options */
  filterOptions?: { label: string; value: string }[];
  /** Active filter */
  activeFilter?: string;
  /** Callback when filter changes */
  onFilterChange?: (filter: string) => void;
  /** Callback when review helpful clicked */
  onHelpful?: (reviewId: string) => void;
  /** Callback when write review clicked */
  onWriteReview?: () => void;
  /** Show write review button */
  showWriteButton?: boolean;
  /** Max reviews to show initially */
  maxInitial?: number;
}

export interface ReviewItem extends ReviewCardProps {
  id: string;
  helpfulCount?: number;
  isHelpfulClicked?: boolean;
}

/* ------------------------------------------------------------------ */
/*  DEFAULT DATA                                                       */
/* ------------------------------------------------------------------ */

const defaultFilterOptions = [
  { label: "全部", value: "all" },
  { label: "最新", value: "newest" },
  { label: "5 星", value: "5" },
  { label: "4 星", value: "4" },
  { label: "3 星", value: "3" },
  { label: "附照片", value: "with-photo" },
  { label: "已驗證購買", value: "verified" },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function ReviewSection({
  title = "顧客真實評價",
  subtitle = "來自使用者的第一手心得",
  reviews = [],
  averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
  totalReviews = reviews.length,
  ratingDistribution = reviews.reduce<Record<number, number>>((counts, review) => { counts[review.rating] = (counts[review.rating] ?? 0) + 1; return counts; }, {}),
  showBreakdown = true,
  filterOptions = defaultFilterOptions,
  activeFilter = "all",
  onFilterChange,
  onHelpful,
  onWriteReview,
  showWriteButton = true,
  maxInitial = 6,
  className,
  ...props
}: ReviewSectionProps) {
  const [internalFilter, setInternalFilter] = useState(activeFilter);
  const [expanded, setExpanded] = useState(false);

  const effectiveFilter = onFilterChange ? activeFilter : internalFilter;

  const filtered = reviews.filter((r) => {
    switch (effectiveFilter) {
      case "all":
        return true;
      case "newest":
        return true; // Already sorted newest first
      case "with-photo":
        return false; // No photo data in default
      case "verified":
        return r.verified;
      case "5":
      case "4":
      case "3":
      case "2":
      case "1":
        return r.rating === parseInt(effectiveFilter);
      default:
        return true;
    }
  });

  const displayed = expanded ? filtered : filtered.slice(0, maxInitial);

  return (
    <section className={cn("px-4 py-10 lg:px-8", className)} {...props}>
      {/* Header */}
      <div className="mb-6 text-center md:mb-8">
        {title && (
          <div className="mb-2 flex items-center justify-center gap-2">
            <Star className="h-6 w-6 fill-pet-paw text-pet-paw" />
            <Heading as="h2" variant="h2">
              {title}
            </Heading>
          </div>
        )}
        {subtitle && (
          <Text variant="body" color="muted">
            {subtitle}
          </Text>
        )}
      </div>

      {/* Rating Summary */}
      {showBreakdown && (
        <div className="mx-auto mb-8 grid max-w-2xl grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
          {/* Left: Average */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.round(averageRating)
                      ? "fill-pet-paw text-pet-paw"
                      : "fill-neutral-200 text-neutral-200"
                  )}
                />
              ))}
            </div>
            <Text variant="bodySmall" color="muted" className="mt-1">
              共 {totalReviews.toLocaleString()} 則評價
            </Text>
          </div>

          {/* Right: Distribution */}
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] ?? 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-right text-muted-foreground">
                    {star}
                  </span>
                  <Star className="h-3.5 w-3.5 fill-pet-paw text-pet-paw" />
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {count > 0 ? `${Math.round(pct)}%` : "0%"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {filterOptions.map((opt) => {
          const isActive = effectiveFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setInternalFilter(opt.value);
                onFilterChange?.(opt.value);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-neutral-100 text-muted-foreground hover:bg-neutral-200"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayed.map((review) => (
          <ReviewCard
            key={review.id}
            {...review}
            onHelpful={() => onHelpful?.(review.id)}
          />
        ))}
      </div>

      {/* Load More */}
      {filtered.length > maxInitial && !expanded && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setExpanded(true)}
          >
            查看更多評價 ({filtered.length - maxInitial})
          </Button>
        </div>
      )}

      {/* Write Review CTA */}
      {showWriteButton && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-neutral-50 p-6 text-center">
          <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
          <div>
            <Text variant="body" weight="semibold">
              使用過我們的產品嗎？
            </Text>
            <Text variant="bodySmall" color="muted">
              分享您的使用心得，幫助其他飼主做出選擇
            </Text>
          </div>
          <Button onClick={onWriteReview} className="gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            撰寫評價
          </Button>
        </div>
      )}
    </section>
  );
}

ReviewSection.displayName = "ReviewSection";
