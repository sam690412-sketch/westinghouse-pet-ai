import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  PackageOpen,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/atomic/Typography";
import { useCart } from "@/hooks/useCart";

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FREE_SHIPPING_THRESHOLD = 1500;

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    items,
    cartCount,
    cartTotal,
    freeShippingProgress,
    updateQuantity,
    removeItem,
    isLoading,
    error,
  } = useCart();

  const isEmpty = items.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-cart-drawer bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-cart-drawer flex w-full max-w-md flex-col bg-background shadow-xl transition-transform duration-300 ease-out-expo",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="購物車"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">購物車</h2>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="關閉購物車"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Content */}
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <PackageOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <Text variant="bodyLarge" weight="semibold">
              購物車是空的
            </Text>
            <Text variant="bodySmall" color="muted" className="mt-1 mb-6">
              快去選購喜歡的商品吧！
            </Text>
            <Button onClick={onClose} className="gap-2">
              繼續購物
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="border-b border-border px-5 py-3">
              {freeShippingProgress.qualifies ? (
                <div className="flex items-center gap-2 text-sm text-success">
                  <span className="font-medium">恭喜！您已達成免運門檻</span>
                </div>
              ) : (
                <>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      再 NT${(FREE_SHIPPING_THRESHOLD - cartTotal).toLocaleString()} 即可享免運
                    </span>
                    <span className="text-muted-foreground">
                      NT${FREE_SHIPPING_THRESHOLD.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-success transition-all duration-500 ease-out"
                      style={{ width: `${freeShippingProgress.percentage}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 px-5 py-3">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    {/* Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <PackageOpen className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Text variant="label" weight="semibold" className="line-clamp-1">
                          {item.name}
                        </Text>
                        {item.tagline && (
                          <Text variant="caption" color="muted" className="line-clamp-1">
                            {item.tagline}
                          </Text>
                        )}
                        <Text variant="body" weight="bold" className="mt-0.5 text-primary">
                          NT${(item.price / 100).toLocaleString()}
                        </Text>
                      </div>

                      {/* Actions */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            aria-label="減少數量"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex h-7 w-8 items-center justify-center text-sm font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity || isLoading}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            aria-label="增加數量"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
                          aria-label="移除商品"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border bg-neutral-50 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">小計</span>
                <span className="font-medium">NT${cartTotal.toLocaleString()}</span>
              </div>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">運費</span>
                <span className={cn("font-medium", freeShippingProgress.qualifies ? "text-success" : "text-foreground")}>
                  {freeShippingProgress.qualifies ? "免運" : "待計算"}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-bold">合計</span>
                <span className="text-xl font-bold text-primary">
                  NT${cartTotal.toLocaleString()}
                </span>
              </div>
              <Button
                className="w-full gap-2 text-base font-semibold shadow-button transition-all hover:shadow-button-hover active:scale-[0.98]"
                size="lg"
                onClick={() => (window.location.href = "/checkout")}
              >
                前往結帳
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={onClose}
              >
                繼續購物
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

CartDrawer.displayName = "CartDrawer";
