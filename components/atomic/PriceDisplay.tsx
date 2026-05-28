import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface PriceDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
}

export const PriceDisplay = forwardRef<HTMLDivElement, PriceDisplayProps>(
  ({ price, originalPrice, currency = "NT$", size = "md", showDiscount = true, className, ...props }, ref) => {
    const discount = originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const sizeClasses = {
      sm: { price: "text-lg", original: "text-sm", badge: "text-xs" },
      md: { price: "text-2xl", original: "text-base", badge: "text-sm" },
      lg: { price: "text-3xl md:text-4xl", original: "text-xl", badge: "text-sm" },
    }[size];

    return (
      <div ref={ref} className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)} {...props}>
        <span className={cn("font-bold text-primary", sizeClasses.price)}>
          {currency}
          {(price / 100).toLocaleString("zh-TW")}
        </span>
        {originalPrice && originalPrice > price && (
          <>
            <span className={cn("text-muted-foreground line-through decoration-error/50", sizeClasses.original)}>
              {currency}
              {(originalPrice / 100).toLocaleString("zh-TW")}
            </span>
            {showDiscount && discount > 0 && (
              <span className={cn("rounded-full bg-pet-paw/10 px-2 py-0.5 font-semibold text-pet-paw-dark", sizeClasses.badge)}>
                -{discount}%
              </span>
            )}
          </>
        )}
      </div>
    );
  }
);
PriceDisplay.displayName = "PriceDisplay";
