import { X, Tag, Truck, Gift, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/atomic/Typography";
import { forwardRef, useState } from "react";

type PromoType = "discount" | "shipping" | "gift" | "urgency";

const promoConfig: Record<PromoType, { icon: typeof Tag; colorClass: string; bgClass: string }> = {
  discount: { icon: Tag, colorClass: "text-pet-paw-dark", bgClass: "bg-pet-paw-light/40" },
  shipping: { icon: Truck, colorClass: "text-info-dark", bgClass: "bg-info-light/40" },
  gift: { icon: Gift, colorClass: "text-success-dark", bgClass: "bg-success-light/40" },
  urgency: { icon: Clock, colorClass: "text-error-dark", bgClass: "bg-error-light/40" },
};

export interface PromoBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: PromoType;
  message: string;
  ctaText?: string;
  onCtaClick?: () => void;
  dismissible?: boolean;
  countdown?: string;
}

export const PromoBanner = forwardRef<HTMLDivElement, PromoBannerProps>(
  ({ type = "discount", message, ctaText, onCtaClick, dismissible = true, countdown, className, ...props }, ref) => {
    const [dismissed, setDismissed] = useState(false);
    const config = promoConfig[type];
    const Icon = config.icon;

    if (dismissed) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-4 py-3",
          config.bgClass,
          className
        )}
        role="alert"
        {...props}
      >
        <Icon className={cn("h-5 w-5 shrink-0", config.colorClass)} aria-hidden="true" />
        <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          <Text variant="bodySmall" className={config.colorClass}>
            {message}
          </Text>
          {countdown && (
            <span className={cn("font-mono text-sm font-bold", config.colorClass)}>
              {countdown}
            </span>
          )}
          {ctaText && (
            <button
              type="button"
              onClick={onCtaClick}
              className={cn(
                "text-sm font-semibold underline underline-offset-2 transition-opacity hover:opacity-70",
                config.colorClass
              )}
            >
              {ctaText}
            </button>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={cn("shrink-0 rounded-md p-1 transition-colors hover:bg-black/5", config.colorClass)}
            aria-label="關閉"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
PromoBanner.displayName = "PromoBanner";
