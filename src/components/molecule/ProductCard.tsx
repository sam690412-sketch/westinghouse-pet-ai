import { Heart, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/atomic/PriceDisplay";
import { RatingStars } from "@/components/atomic/RatingStars";
import { StockStatus } from "@/components/atomic/StockStatus";
import { Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { forwardRef } from "react";

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  slug: string;
  name: string;
  tagline?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock" | "pre_order";
  isNew?: boolean;
  isBestseller?: boolean;
  onAddToCart?: (slug: string) => void;
  onWishlist?: (slug: string) => void;
  onQuickView?: (slug: string) => void;
  layout?: "vertical" | "horizontal";
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({
    slug,
    name,
    tagline,
    price,
    originalPrice,
    imageUrl,
    rating = 0,
    reviewCount = 0,
    stockStatus = "in_stock",
    isNew = false,
    isBestseller = false,
    onAddToCart,
    onWishlist,
    onQuickView,
    layout = "vertical",
    className,
    ...props
  }, ref) => {
    const isHorizontal = layout === "horizontal";

    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover",
          isHorizontal && "flex flex-row",
          className
        )}
        {...props}
      >
        {/* Image Container */}
        <div
         className={cn(
           "relative flex items-center justify-center overflow-hidden bg-white",
           isHorizontal
             ? "w-40 md:w-48 shrink-0"
             : "h-[520px] md:h-[560px] w-full"
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="max-h-full max-w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-sm">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isNew && (
              <span className="rounded-full bg-success px-2 py-0.5 text-xs font-bold text-white">
                新品
              </span>
            )}
            {isBestseller && (
              <span className="rounded-full bg-pet-paw px-2 py-0.5 text-xs font-bold text-white">
                熱銷
              </span>
            )}
            {originalPrice && originalPrice > price && (
              <span className="rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white">
                -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Quick actions overlay */}
          <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onWishlist?.(slug)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-primary"
              aria-label="加入收藏"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onQuickView?.(slug)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-primary"
              aria-label="快速預覽"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={cn("flex flex-col p-4", isHorizontal && "flex-1")}>
          {stockStatus && (
            <div className="mb-1.5">
              <StockStatus status={stockStatus} />
            </div>
          )}

          <Text variant="label" weight="semibold" className="mb-0.5 line-clamp-1">
            {name}
          </Text>

          {tagline && (
            <Text variant="caption" color="muted" className="mb-2 line-clamp-1">
              {tagline}
            </Text>
          )}

          {rating > 0 && (
            <div className="mb-2">
              <RatingStars rating={rating} reviewCount={reviewCount} size="sm" />
            </div>
          )}

          <div className="mt-auto pt-2">
            <PriceDisplay
              price={price}
              originalPrice={originalPrice}
              size={isHorizontal ? "sm" : "md"}
            />
          </div>

          {stockStatus !== "out_of_stock" && (
            <Button
              size="sm"
              className="mt-3 w-full gap-2 bg-primary text-primary-foreground shadow-button transition-all hover:bg-primary/90 hover:shadow-button-hover active:scale-[0.98]"
              onClick={() => onAddToCart?.(slug)}
            >
              <ShoppingCart className="h-4 w-4" />
              加入購物車
            </Button>
          )}
        </div>
      </div>
    );
  }
);
ProductCard.displayName = "ProductCard";
