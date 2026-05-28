import { useState, useEffect } from "react";
import { ShoppingCart, X, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface StickyCTAProps {
  /** Product name to display */
  productName: string;
  /** Product SKU for adding to cart */
  sku?: string;
  /** Current price */
  price: number;
  /** Original price (for strikethrough) */
  originalPrice?: number;
  /** Whether product is in stock */
  inStock?: boolean;
  /** Callback when add to cart clicked */
  onAddToCart?: () => void;
  /** Callback when buy now clicked */
  onBuyNow?: () => void;
  /** Callback when contact support clicked */
  onContactSupport?: () => void;
  /** Callback when live chat clicked */
  onLiveChat?: () => void;
  /** Scroll threshold to appear (px) */
  scrollThreshold?: number;
  /** Hide delay after scroll up (ms) */
  hideDelay?: number;
  /** Whether to show on desktop */
  showOnDesktop?: boolean;
  /** Custom className */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function StickyCTA({
  productName,
  sku,
  price,
  originalPrice,
  inStock = true,
  onAddToCart,
  onContactSupport,
  onLiveChat,
  scrollThreshold = 300,
  hideDelay = 3000,
  showOnDesktop = false,
  className,
}: StickyCTAProps) {
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const currentY = window.scrollY;

      setLastScrollY(currentY);

      if (currentY > scrollThreshold && !dismissed) {
        setVisible(true);
      } else if (currentY <= scrollThreshold) {
        setVisible(false);
      }

      // Auto-hide after delay when scrolling up
      if (currentY > scrollThreshold && currentY < lastScrollY) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          setVisible(false);
        }, hideDelay);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(hideTimer);
    };
  }, [lastScrollY, scrollThreshold, dismissed, hideDelay]);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-sticky-cta border-t border-border bg-background/95 backdrop-blur-md shadow-sticky-cta transition-transform duration-300 ease-out-expo",
        visible && !dismissed
          ? "translate-y-0"
          : "translate-y-full",
        !showOnDesktop && "md:hidden",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        {/* Product Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{productName}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              NT${(price / 100).toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  NT${originalPrice.toLocaleString()}
                </span>
                <span className="rounded bg-error/10 px-1 py-0.5 text-[10px] font-bold text-error">
                  -{discount}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Contact Buttons (compact) */}
          {onContactSupport && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={onContactSupport}
              aria-label="聯絡客服"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {onLiveChat && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={onLiveChat}
              aria-label="線上諮詢"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}

          {/* Main CTA */}
          <Button
            size="sm"
            className="h-10 gap-2 px-5 font-semibold shadow-button transition-all hover:shadow-button-hover active:scale-[0.98]"
            disabled={!inStock}
            onClick={() => {
              if (sku) addItem(sku, 1);
              onAddToCart?.();
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? "加入購物車" : "暫時缺貨"}
          </Button>

          {/* Dismiss */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="關閉"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Safe area padding */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DESKTOP VARIANT                                                    */
/* ------------------------------------------------------------------ */

export interface StickyCTADesktopProps {
  /** Product name */
  productName: string;
  /** Current price */
  price: number;
  /** Original price */
  originalPrice?: number;
  /** Whether in stock */
  inStock?: boolean;
  /** Thumbnail image URL */
  thumbnailUrl?: string;
  /** Callback when add to cart clicked */
  onAddToCart?: () => void;
  /** Callback when buy now clicked */
  onBuyNow?: () => void;
  /** Scroll threshold */
  scrollThreshold?: number;
  className?: string;
}

export function StickyCTADesktop({
  productName,
  price,
  originalPrice,
  inStock = true,
  thumbnailUrl,
  onAddToCart,
  onBuyNow,
  scrollThreshold = 500,
  className,
}: StickyCTADesktopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > scrollThreshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-sticky-cta border-b border-border bg-background/95 backdrop-blur-md shadow-sm transition-transform duration-300 ease-out-expo",
        visible ? "translate-y-0" : "-translate-y-full",
        "hidden md:block",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-2.5">
        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
            <img
              src={thumbnailUrl}
              alt={productName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Product Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {productName}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-primary">
              NT${(price / 100).toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                NT${originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!inStock}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            加入購物車
          </Button>
          <Button
            size="sm"
            className="gap-2 font-semibold shadow-button transition-all hover:shadow-button-hover"
            disabled={!inStock}
            onClick={onBuyNow}
          >
            立即購買
          </Button>
        </div>
      </div>
    </div>
  );
}

StickyCTA.displayName = "StickyCTA";
StickyCTADesktop.displayName = "StickyCTADesktop";
