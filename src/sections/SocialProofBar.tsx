import { Users, Clock, Truck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  COMPONENT — Floating social proof bar                              */
/*  Shows recent purchase activity + urgency                           */
/* ------------------------------------------------------------------ */

const MESSAGES = [
  { icon: Users, text: "陳小姐 剛購買了 M81 餵食器", time: "2 分鐘前" },
  { icon: Users, text: "林先生 購買了 D11-BA 飲水機", time: "5 分鐘前" },
  { icon: Users, text: "王太太 一次買了 2 台餵食器", time: "8 分鐘前" },
  { icon: Users, text: "張先生 購買了 D61 飲水機", time: "12 分鐘前" },
  { icon: Users, text: "李小姐 購買了 M31 扭蛋餵食器", time: "15 分鐘前" },
];

export function SocialProofBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after 3 seconds
    const showTimer = setTimeout(() => setVisible(true), 3000);

    // Rotate messages every 5 seconds
    const rotateTimer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % MESSAGES.length);
    }, 5000);

    // Hide after 30 seconds
    const hideTimer = setTimeout(() => setVisible(false), 30000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(rotateTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const msg = MESSAGES[current];
  const Icon = msg.icon;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-40 max-w-sm transition-all duration-500 sm:bottom-6 sm:left-6",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">{msg.text}</p>
          <p className="text-xs text-muted-foreground">{msg.time}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  URGENCY BANNER — Top of product page                               */
/* ------------------------------------------------------------------ */

interface UrgencyBannerProps {
  stockStatus: string;
  stockQuantity?: number;
  viewerCount?: number;
}

export function UrgencyBanner({ stockStatus, stockQuantity, viewerCount = 12 }: UrgencyBannerProps) {
  const isLowStock = stockStatus === "low_stock";
  const isOutOfStock = stockStatus === "out_of_stock";

  if (isOutOfStock) {
    return (
      <div className="mx-auto max-w-7xl px-6 pt-3 sm:px-12 lg:px-20">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>此商品暫時缺貨，補貨中。可加入願望清單收到通知。</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-3 sm:px-12 lg:px-20">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
        {/* Stock urgency */}
        {isLowStock && stockQuantity && stockQuantity <= 10 && (
          <span className="flex items-center gap-1.5 rounded-full bg-error/10 px-3 py-1 font-medium text-error">
            <Clock className="h-3.5 w-3.5" />
            僅剩 {stockQuantity} 件 — 即將完售
          </span>
        )}

        {/* Viewers */}
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {viewerCount} 人正在瀏覽此商品
        </span>

        {/* Shipping */}
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Truck className="h-3.5 w-3.5" />
          今天下單，預計 1-3 天到貨
        </span>

        {/* Rating */}
        <span className="flex items-center gap-1 text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          4.8 (128 則評價)
        </span>
      </div>
    </div>
  );
}
