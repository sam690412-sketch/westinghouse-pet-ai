import { useState } from "react";
import {
  BookOpen,
  Wrench,
  ShieldCheck,
  Sparkles,
  Download,
  MessageCircleQuestion,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SolutionCard } from "@/components/molecule/SolutionCard";
import { Heading, Text } from "@/components/atomic/Typography";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface SolutionCategory {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface SolutionsGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Solution items */
  solutions?: SolutionItem[];
  /** Categories for filter tabs */
  categories?: SolutionCategory[];
  /** Active category */
  activeCategory?: string;
  /** Callback when category changes */
  onCategoryChange?: (category: string) => void;
  /** Search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Callback when a solution is clicked */
  onSolutionClick?: (id: string) => void;
  /** Layout variant */
  layout?: "grid" | "featured" | "compact";
}

export interface SolutionItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  articleCount?: number;
  productCount?: number;
  href: string;
  featured?: boolean;
}

/* ------------------------------------------------------------------ */
/*  DEFAULT DATA                                                       */
/* ------------------------------------------------------------------ */

const defaultCategories: SolutionCategory[] = [
  { id: "all", label: "全部", icon: BookOpen },
  { id: "getting-started", label: "新手入門", icon: Sparkles },
  { id: "troubleshooting", label: "問題排解", icon: Wrench },
  { id: "maintenance", label: "清潔保養", icon: ShieldCheck },
  { id: "firmware", label: "韌體更新", icon: Download },
  { id: "faq", label: "常見問答", icon: MessageCircleQuestion },
];

const defaultSolutions: SolutionItem[] = [
  {
    id: "sg-001",
    title: "智能飲水機首次使用設定",
    description:
      "從開箱到正式使用的完整設定流程，包含濾芯安裝、水箱注水與APP連線步驟。",
    category: "getting-started",
    articleCount: 5,
    productCount: 3,
    href: "/solutions/smart-water-fountain-setup",
    featured: true,
  },
  {
    id: "sg-002",
    title: "自動餵食器 Wi-Fi 連線教學",
    description:
      "解決連線失敗、訊號不穩等常見問題，確保隨時掌握寵物餵食狀況。",
    category: "getting-started",
    articleCount: 4,
    productCount: 2,
    href: "/solutions/feeder-wifi-setup",
    featured: true,
  },
  {
    id: "sg-003",
    title: "飲水機不出水怎麼辦？",
    description:
      "逐步排查馬達、水管、水位感應器，快速恢復飲水機正常運作。",
    category: "troubleshooting",
    articleCount: 3,
    productCount: 2,
    href: "/solutions/water-fountain-no-flow",
  },
  {
    id: "sg-004",
    title: "餵食器卡糧處理方式",
    description:
      "針對不同飼料形狀與大小的卡糧問題，提供有效的清潔與調整建議。",
    category: "troubleshooting",
    articleCount: 2,
    productCount: 1,
    href: "/solutions/feeder-jam-fix",
  },
  {
    id: "sg-005",
    title: "濾芯更換週期與步驟",
    description:
      "建議每 30 天更換一次濾芯，確保水質潔淨。包含詳細更換圖解教學。",
    category: "maintenance",
    articleCount: 3,
    productCount: 4,
    href: "/solutions/filter-replacement",
    featured: true,
  },
  {
    id: "sg-006",
    title: "烘乾箱日常清潔保養",
    description:
      "正確的清潔流程與消毒建議，延長設備壽命並確保寵物健康。",
    category: "maintenance",
    articleCount: 4,
    productCount: 2,
    href: "/solutions/dryer-box-cleaning",
  },
  {
    id: "sg-007",
    title: "韌體更新至 v2.4",
    description:
      "新增智慧排程與用量分析功能，了解本次更新的完整內容與升級步驟。",
    category: "firmware",
    articleCount: 2,
    productCount: 5,
    href: "/solutions/firmware-v24",
  },
  {
    id: "sg-008",
    title: "新功能：寵物健康追蹤",
    description:
      "整合飲水與餵食數據，提供寵物日常健康趨勢分析報告。",
    category: "firmware",
    articleCount: 3,
    productCount: 3,
    href: "/solutions/health-tracking",
    featured: true,
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function SolutionsGrid({
  title = "使用指南",
  subtitle = "從新手入門到進階設定，完整解答您的所有問題",
  solutions = defaultSolutions,
  categories = defaultCategories,
  activeCategory = "all",
  onCategoryChange,
  searchQuery = "",
  onSearchChange,
  isLoading = false,
  onSolutionClick,
  layout = "grid",
  className,
  ...props
}: SolutionsGridProps) {
  const [internalCategory, setInternalCategory] = useState(activeCategory);
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  const effectiveCategory = onCategoryChange ? activeCategory : internalCategory;
  const effectiveSearch = onSearchChange ? searchQuery : internalSearch;

  const filtered = solutions.filter((s) => {
    const matchCategory =
      effectiveCategory === "all" || s.category === effectiveCategory;
    const matchSearch =
      !effectiveSearch ||
      s.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(effectiveSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featuredItems = filtered.filter((s) => s.featured);
  const regularItems = filtered.filter((s) => !s.featured);

  return (
    <section className={cn("px-4 py-10 lg:px-8", className)} {...props}>
      {/* Section Header */}
      <div className="mb-6 text-center md:mb-8">
        {title && (
          <Heading as="h2" variant="h2">
            {title}
          </Heading>
        )}
        {subtitle && (
          <Text variant="body" color="muted" className="mt-2">
            {subtitle}
          </Text>
        )}
      </div>

      {/* Search Bar */}
      <div className="mx-auto mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜尋使用指南..."
            value={effectiveSearch}
            onChange={(e) => {
              setInternalSearch(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            className="h-10 pl-10"
            aria-label="搜尋使用指南"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = effectiveCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setInternalCategory(cat.id);
                onCategoryChange?.(cat.id);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-neutral-100 text-muted-foreground hover:bg-neutral-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-border p-5"
            >
              <div className="mb-3 h-5 w-2/3 rounded bg-neutral-200" />
              <div className="mb-2 h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-4/5 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Featured Layout */}
          {layout === "featured" && featuredItems.length > 0 && (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pet-paw" />
                <Text variant="label" weight="bold">
                  精選指南
                </Text>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {featuredItems.map((item) => (
                  <SolutionCard
                    key={item.id}
                    slug={item.id}
                    title={item.title}
                    description={item.description}
                    imageUrl={item.imageUrl}
                    articleCount={item.articleCount}
                    productCount={item.productCount}
                    variant="featured"
                    onClick={() => onSolutionClick?.(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Grid */}
          {(layout === "featured"
            ? regularItems
            : filtered
          ).length > 0 && (
            <div
              className={cn(
                "grid gap-4",
                layout === "compact"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {(layout === "featured" ? regularItems : filtered).map(
                (item) => (
                  <SolutionCard
                    key={item.id}
                    slug={item.id}
                    title={item.title}
                    description={item.description}
                    imageUrl={item.imageUrl}
                    articleCount={item.articleCount}
                    productCount={item.productCount}
                    variant={layout === "compact" ? "compact" : "default"}
                    onClick={() => onSolutionClick?.(item.id)}
                  />
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {filtered.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            沒有符合條件的指南
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            請嘗試其他關鍵字或分類
          </p>
        </div>
      )}

      {/* View All Link */}
      <div className="mt-8 text-center">
        <Button variant="outline" className="gap-2" asChild>
          <a href="/solutions">
            查看全部使用指南
            <ChevronRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}

SolutionsGrid.displayName = "SolutionsGrid";
