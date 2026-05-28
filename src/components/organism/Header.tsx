import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Menu, X, ShoppingCart, Search, User, ChevronDown, ChevronRight,
  PawPrint, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import {
  NavigationMenu, NavigationMenuContent,
  NavigationMenuItem, NavigationMenuList,
  NavigationMenuTrigger, navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

/* ================================================================ */
/*  TYPES                                                             */
/* ================================================================ */

export interface NavGrandChild { label: string; href: string; tag?: string; }
export interface NavChild {
  label: string; href: string; description?: string; featured?: boolean; children?: NavGrandChild[];
}
export interface NavItem { label: string; href: string; children?: NavChild[]; }

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logoText?: string; wishlistCount?: number; isAuthenticated?: boolean; userName?: string;
  onSearch?: (query: string) => void; onCartClick?: () => void; onWishlistClick?: () => void;
  onLoginClick?: () => void; onAccountClick?: () => void; onMobileMenuToggle?: (open: boolean) => void;
}

/* ================================================================ */
/*  NAV DATA — slug 与 App.tsx routes 严格对应                       */
/* ================================================================ */

const defaultNavItems: NavItem[] = [
  {
    label: "商品總覽", href: "/products",
    children: [
      {
        label: "自動餵食器", href: "/products/feeders", description: "定時定量，智慧餵食",
        children: [
          { label: "M81 鮮濕糧智慧餵食器", href: "/products/m81-fresh-food-feeder", tag: "旗艦" },
          { label: "M12 智慧全景餵食器", href: "/products/m12-panoramic-feeder", tag: "熱銷" },
          { label: "M31 智慧扭蛋餵食器", href: "/products/m31-gashapon-feeder" },
        ],
      },
      {
        label: "寵物飲水機", href: "/products/water-dispensers", description: "循環過濾，新鮮活水",
        children: [
          { label: "D11-BA 智慧寵物飲水機", href: "/products/d11ba-water-dispenser", tag: "熱銷" },
          { label: "D61 智慧不鏽鋼寵物飲水機", href: "/products/d61-stainless-dispenser" },
        ],
      },
      {
        label: "耗材配件", href: "/products/accessories", description: "濾芯、電源線等原廠配件",
        children: [
          { label: "飲水機濾芯組", href: "/products/d11ba-water-dispenser" },
          { label: "餵食器配件", href: "/products/m81-fresh-food-feeder" },
        ],
      },
      {
        label: "組合方案", href: "/products", description: "精選組合更優惠",
        children: [
          { label: "餵食+飲水組合", href: "/products/m81-fresh-food-feeder" },
          { label: "新手入門組", href: "/products/d11ba-water-dispenser" },
        ],
      },
    ],
  },
  {
    label: "使用指南", href: "/solutions",
    children: [
      { label: "貓咪不喝水", href: "/solutions/cat-not-drinking-water", description: "飲水習慣改善攻略" },
      { label: "多貓家庭", href: "/solutions/multi-cat-household-feeding", description: "多貓共用與分流方案" },
      { label: "長時間不在家", href: "/solutions/long-hours-away-cat-care", description: "出差旅行安心餵食" },
      { label: "濕糧保存", href: "/solutions/wet-food-fresh-storage", description: "鮮食保鮮不浪費" },
      { label: "腎貓照護", href: "/solutions/kidney-disease-cat-care", description: "腎貓飲水與飲食管理" },
      { label: "新手養貓", href: "/solutions/first-time-cat-owner-essentials", description: "第一次養貓必備指南" },
    ],
  },
  {
    label: "品牌故事", href: "/brand",
    children: [
      { label: "品牌理念", href: "/brand/story", description: "用科技守護毛孩" },
      { label: "官方授權", href: "/trust/official-license", description: "台灣獨家總代理" },
      { label: "台灣保固", href: "/trust/warranty-commitment", description: "一年原廠保固" },
      { label: "品質承諾", href: "/trust/quality-certifications", description: "嚴格品質控管" },
    ],
  },
  { label: "顧客評價", href: "/reviews" },
  {
    label: "常見問題", href: "/faq",
    children: [
      { label: "付款問題", href: "/faq/payment" },
      { label: "配送問題", href: "/faq/shipping" },
      { label: "保固問題", href: "/faq/warranty" },
      { label: "商品使用", href: "/faq/product-usage" },
      { label: "濾芯更換", href: "/faq/filter-replacement" },
    ],
  },
  { label: "聯絡我們", href: "/contact" },
];

/* ================================================================ */
/*  COMPONENT                                                         */
/* ================================================================ */

export function Header({
  logoText = "Westinghouse Pet", wishlistCount = 0,
  isAuthenticated = false, userName,
  onSearch, onCartClick, onWishlistClick, onLoginClick, onAccountClick, onMobileMenuToggle,
  className, ...props
}: HeaderProps) {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMobileL1, setExpandedMobileL1] = useState<string | null>(null);
  const [expandedMobileL2, setExpandedMobileL2] = useState<string | null>(null);

  const handleMobileToggle = useCallback((open: boolean) => {
    setMobileMenuOpen(open);
    setExpandedMobileL1(null);
    setExpandedMobileL2(null);
    onMobileMenuToggle?.(open);
  }, [onMobileMenuToggle]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) onSearch?.(searchQuery.trim());
  }, [searchQuery, onSearch]);

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-[60] border-b border-border bg-background/95 backdrop-blur-md", className)} {...props}>
      {/* Top Bar */}
      <div className="hidden items-center justify-between border-b border-border/50 bg-neutral-50 px-4 py-1.5 text-xs text-muted-foreground md:flex lg:px-8">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><PawPrint className="h-3 w-3 text-pet-paw" />台灣官方旗艦店</span>
          <span className="hidden lg:inline">|</span>
          <span className="hidden lg:inline">全館滿 NT$1,500 免運</span>
        </div>
        <div className="flex items-center gap-4">
          <span>客服專線: 0800-000-000</span>
          <span className="hidden lg:inline">|</span>
          <span className="hidden lg:inline">週一至週五 09:00-18:00</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary">
          <PawPrint className="h-7 w-7 text-primary" />
          <span className="hidden sm:inline">{logoText}</span>
        </Link>

        {/* Desktop MegaMenu */}
        <NavigationMenu className="hidden lg:flex z-[70]">
          <NavigationMenuList className="gap-0.5">
            {defaultNavItems.map((item) =>
              item.children?.length ? (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuTrigger className="text-sm font-medium px-3 py-2 h-auto">{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent className="z-[70]">
                    <MegaMenuPanel item={item} />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.label}>
                  <Link to={item.href} className={cn(navigationMenuTriggerStyle(), "text-sm font-medium px-3 py-2 h-auto")}>
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <form onSubmit={handleSearchSubmit} className={cn("flex items-center overflow-hidden transition-all duration-300", searchOpen ? "w-48 opacity-100 sm:w-64" : "w-0 opacity-0")}>
            <Input type="text" placeholder="搜尋商品..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 text-sm" aria-label="搜尋商品" />
          </form>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen((p) => !p)} aria-label={searchOpen ? "關閉搜尋" : "開啟搜尋"}>
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="relative hidden h-9 w-9 sm:flex" onClick={onWishlistClick} aria-label="收藏清單">
            <Heart className="h-[18px] w-[18px]" />
            {wishlistCount > 0 && <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center p-0 text-[10px]">{wishlistCount}</Badge>}
          </Button>
          <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={onCartClick} aria-label="購物車">
            <ShoppingCart className="h-[18px] w-[18px]" />
            {cartCount > 0 && <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center p-0 text-[10px]">{cartCount}</Badge>}
          </Button>
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" className="hidden items-center gap-1.5 text-sm md:flex" onClick={onAccountClick}>
              <User className="h-4 w-4" /><span className="max-w-[80px] truncate">{userName}</span>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="hidden items-center gap-1.5 text-sm md:flex" onClick={onLoginClick}>
              <User className="h-4 w-4" />登入
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" onClick={() => handleMobileToggle(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer — 3-tier */}
      <div className={cn("overflow-hidden border-t border-border bg-background transition-all duration-300 lg:hidden", mobileMenuOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0")}>
        <nav className="max-h-[75vh] overflow-y-auto px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="flex gap-2">
              <Input type="text" placeholder="搜尋商品..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 text-sm" aria-label="搜尋商品" />
              <Button type="submit" size="sm" className="h-10 px-4"><Search className="h-4 w-4" /></Button>
            </div>
          </form>

          <ul className="space-y-1">
            {defaultNavItems.map((item) => (
              <li key={item.label}>
                {item.children?.length ? (
                  <div className="rounded-lg border border-border">
                    <button type="button" onClick={() => setExpandedMobileL1((prev) => prev === item.label ? null : item.label)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent">
                      {item.label}
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expandedMobileL1 === item.label && "rotate-180")} />
                    </button>
                    <div className={cn("overflow-hidden transition-all duration-200", expandedMobileL1 === item.label ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0")}>
                      <ul className="space-y-0.5 border-t border-border bg-neutral-50 px-2 py-2">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            {child.children?.length ? (
                              <div className="rounded-md border border-border/50 overflow-hidden">
                                <button type="button" onClick={() => setExpandedMobileL2((prev) => prev === child.label ? null : child.label)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-white hover:text-foreground">
                                  <span>{child.label}{child.description && <span className="block text-[11px] text-muted-foreground/60">{child.description}</span>}</span>
                                  <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-200", expandedMobileL2 === child.label && "rotate-90")} />
                                </button>
                                <div className={cn("overflow-hidden transition-all duration-200", expandedMobileL2 === child.label ? "max-h-60 opacity-100" : "max-h-0 opacity-0")}>
                                  <ul className="border-t border-border/50 bg-white px-2 py-1.5 space-y-0.5">
                                    {child.children.map((grand) => (
                                      <li key={grand.label}>
                                        <Link to={grand.href} onClick={() => handleMobileToggle(false)} className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                                          <span>{grand.label}</span>
                                          {grand.tag && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-primary/30 text-primary">{grand.tag}</Badge>}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <Link to={child.href} onClick={() => handleMobileToggle(false)} className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white hover:text-foreground">
                                <span>{child.label}{child.description && <span className="block text-[11px] text-muted-foreground/60">{child.description}</span>}</span>
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link to={item.href} onClick={() => handleMobileToggle(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {isAuthenticated ? (
              <Button variant="outline" className="w-full justify-start gap-2" onClick={onAccountClick}><User className="h-4 w-4" />我的帳號 ({userName})</Button>
            ) : (
              <Button variant="outline" className="w-full justify-start gap-2" onClick={onLoginClick}><User className="h-4 w-4" />登入 / 註冊</Button>
            )}
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onWishlistClick}>
              <Heart className="h-4 w-4" />收藏清單
              {wishlistCount > 0 && <Badge variant="secondary" className="ml-auto">{wishlistCount}</Badge>}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ================================================================ */
/*  MEGA MENU PANEL — Desktop 3-tier                                 */
/* ================================================================ */

function MegaMenuPanel({ item }: { item: NavItem }) {
  if (!item.children?.length) return null;

  return (
    <div className="grid w-[680px] grid-cols-12 gap-0">
      <div className="col-span-8 p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {item.children.map((child) => (
            <div key={child.label}>
              <Link to={child.href} className="group flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors">
                {child.label}
                <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              {child.description && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{child.description}</p>}
              {child.children?.length && (
                <ul className="mt-1.5 space-y-0.5">
                  {child.children.map((grand) => (
                    <li key={grand.label}>
                      <Link to={grand.href} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5">
                        {grand.tag ? (
                          <Badge variant="outline" className="text-[9px] h-4 px-1 border-primary/30 text-primary leading-none">{grand.tag}</Badge>
                        ) : <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />}
                        {grand.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-4 bg-accent/30 border-l border-border p-5 flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">推薦</p>
        <Link to="/products/m81-fresh-food-feeder" className="group rounded-lg bg-background p-3 shadow-sm hover:shadow-md transition-shadow border border-border/50 mb-3">
          <p className="text-xs text-muted-foreground mb-1">旗艦新品</p>
          <p className="text-sm font-semibold group-hover:text-primary transition-colors">M81 鮮濕糧智慧餵食器</p>
          <p className="text-xs text-muted-foreground mt-1">支援鮮食與乾糧混合餵食</p>
        </Link>
        <Link to="/products/d11ba-water-dispenser" className="group rounded-lg bg-background p-3 shadow-sm hover:shadow-md transition-shadow border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">熱銷冠軍</p>
          <p className="text-sm font-semibold group-hover:text-primary transition-colors">D11-BA 智慧寵物飲水機</p>
          <p className="text-xs text-muted-foreground mt-1">靜音湧泉循環過濾</p>
        </Link>
        <div className="mt-auto pt-4 border-t border-border/50">
          <Link to={item.href} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            查看全部{item.label}<ChevronDown className="h-3 w-3 -rotate-90" />
          </Link>
        </div>
      </div>
    </div>
  );
}

Header.displayName = "Header";
