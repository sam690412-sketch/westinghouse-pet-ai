import { CheckCircle, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { RatingStars } from "@/components/atomic/RatingStars";
import { Text } from "@/components/atomic/Typography";
import { forwardRef } from "react";

export interface ReviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  productName?: string;
  verified?: boolean;
  helpfulCount?: number;
  avatarUrl?: string;
  onHelpful?: () => void;
}

export const ReviewCard = forwardRef<HTMLDivElement, ReviewCardProps>(
  ({
    author,
    rating,
    title,
    content,
    date,
    productName,
    verified = false,
    helpfulCount,
    avatarUrl,
    onHelpful,
    className,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={author}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {author.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Text variant="label" weight="semibold">
                  {author}
                </Text>
                {verified && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    已驗證購買
                  </span>
                )}
              </div>
              {productName && (
                <Text variant="caption" color="muted">
                  {productName}
                </Text>
              )}
            </div>
          </div>
          <Text variant="caption" color="muted">
            {date}
          </Text>
        </div>

        {/* Rating */}
        <div className="mb-2">
          <RatingStars rating={rating} size="sm" />
        </div>

        {/* Title */}
        <Text variant="label" weight="semibold" className="mb-1">
          {title}
        </Text>

        {/* Content */}
        <Text variant="bodySmall" color="muted" className="mb-3 line-clamp-4">
          {content}
        </Text>

        {/* Footer */}
        {helpfulCount !== undefined && (
          <div className="flex items-center gap-1 border-t border-border pt-3">
            <button
              type="button"
              onClick={onHelpful}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              有幫助 ({helpfulCount})
            </button>
          </div>
        )}
      </div>
    );
  }
);
ReviewCard.displayName = "ReviewCard";
