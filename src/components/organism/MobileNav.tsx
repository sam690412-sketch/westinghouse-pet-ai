import { useState } from "react";
import {
  Home,
  ShoppingBag,
  BookOpen,
  User,
  Phone,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export interface MobileNavProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Navigation items */
  items?: MobileNavItem[];
  /** Currently active item href */
  activeItem?: string;
  /** Callback when item tapped */
  onItemClick?: (item: MobileNavItem) => void;
  /** Label for menu button */
  menuLabel?: string;
  /** Callback when menu button tapped */
  onMenuClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  DEFAULT DATA                                                       */
/* ------------------------------------------------------------------ */

const defaultItems: MobileNavItem[] = [
  { label: "首頁", href: "/", icon: Home },
  { label: "商品", href: "/products", icon: ShoppingBag },
  { label: "指南", href: "/solutions", icon: BookOpen },
  { label: "會員", href: "/account", icon: User },
  { label: "客服", href: "/contact", icon: Phone },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function MobileNav({
  items = defaultItems,
  activeItem = "/",
  onItemClick,
  menuLabel = "選單",
  onMenuClick,
  className,
  ...props
}: MobileNavProps) {
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-mobile-nav border-t border-border bg-background/95 backdrop-blur-md md:hidden",
        "shadow-[0_-2px_10px_rgba(0,0,0,0.05)]",
        className
      )}
      {...props}
      aria-label="手機版底部導覽"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item, index) => {
          const isActive = activeItem === item.href;
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                pressedIndex === index && "scale-90 opacity-70"
              )}
              onClick={(e) => {
                e.preventDefault();
                onItemClick?.(item);
              }}
              onTouchStart={() => setPressedIndex(index)}
              onTouchEnd={() => setPressedIndex(null)}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </a>
          );
        })}

        {/* Menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
          )}
          aria-label={menuLabel}
        >
          <Menu className="h-[22px] w-[22px]" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{menuLabel}</span>
        </button>
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

MobileNav.displayName = "MobileNav";
