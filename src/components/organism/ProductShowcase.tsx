import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Grid3x3,
  LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, type ProductCardProps } from "@/components/molecule/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export type ProductViewMode = "grid" | "list";
export type ProductSortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "newest"
  | "rating";

export interface ProductShowcaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Product data array */
  products: Omit<ProductCardProps, "onAddToCart" | "onWishlist" | "onQuickView">[];
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** View mode */
  viewMode?: ProductViewMode;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: ProductViewMode) => void;
  /** Sort option */
  sortBy?: ProductSortOption;
  /** Callback when sort changes */
  onSortChange?: (sort: ProductSortOption) => void;
  /** Filter categories */
  categories?: { label: string; value: string; count?: number }[];
  /** Active category filter */
  activeCategory?: string;
  /** Callback when category filter changes */
  onCategoryChange?: (category: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Callbacks for product actions */
  onAddToCart?: (slug: string) => void;
  onWishlist?: (slug: string) => void;
  onQuickView?: (slug: string) => void;
  /** Pagination */
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Items per page options */
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** Show filters toolbar */
  showToolbar?: boolean;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function ProductShowcase({
  products,
  title,
  subtitle,
  viewMode = "grid",
  onViewModeChange,
  sortBy = "featured",
  onSortChange,
  categories,
  activeCategory = "all",
  onCategoryChange,
  isLoading = false,
  onAddToCart,
  onWishlist,
  onQuickView,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 12,
  onPageSizeChange,
  showToolbar = true,
  className,
  ...props
}: ProductShowcaseProps) {
  const [internalViewMode, setInternalViewMode] =
    useState<ProductViewMode>(viewMode);

  const effectiveViewMode = onViewModeChange ? viewMode : internalViewMode;

  const handleViewMode = useCallback(
    (mode: ProductViewMode) => {
      setInternalViewMode(mode);
      onViewModeChange?.(mode);
    },
    [onViewModeChange]
  );

  const isGrid = effectiveViewMode === "grid";

  /* ---------- Loading Skeleton ---------- */
  if (isLoading) {
    return (
      <section
        className={cn("px-4 py-10 lg:px-8", className)}
        {...props}
        aria-busy="true"
      >
        {(title || subtitle) && (
          <div className="mb-8 text-center">
            {title && (
              <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-neutral-200" />
            )}
            {subtitle && (
              <div className="mx-auto h-4 w-64 animate-pulse rounded bg-neutral-200" />
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-border bg-card"
            >
              <div className="aspect-product bg-neutral-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
                <div className="h-3 w-1/2 rounded bg-neutral-200" />
                <div className="h-5 w-1/3 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("px-4 py-10 lg:px-8", className)} {...props}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-6 text-center md:mb-8">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Filter Chips */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onCategoryChange?.("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-100 text-muted-foreground hover:bg-neutral-200"
                )}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onCategoryChange?.(cat.value)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    activeCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-neutral-100 text-muted-foreground hover:bg-neutral-200"
                  )}
                >
                  {cat.label}
                  {cat.count !== undefined && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                      {cat.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Sort + View Toggle */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select
              value={sortBy}
              onValueChange={(v) => onSortChange?.(v as ProductSortOption)}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">精選推薦</SelectItem>
                <SelectItem value="price_asc">價格低到高</SelectItem>
                <SelectItem value="price_desc">價格高到低</SelectItem>
                <SelectItem value="name_asc">名稱排序</SelectItem>
                <SelectItem value="newest">最新上架</SelectItem>
                <SelectItem value="rating">評分最高</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-2 flex rounded-md border border-border">
              <button
                type="button"
                onClick={() => handleViewMode("grid")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-l-md transition-colors",
                  isGrid
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
                aria-label="網格檢視"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleViewMode("list")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-r-md transition-colors",
                  !isGrid
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
                aria-label="列表檢視"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid/List */}
      <div
        className={cn(
          isGrid
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            : "flex flex-col gap-4"
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            {...product}
            layout={isGrid ? "vertical" : "horizontal"}
            onAddToCart={onAddToCart}
            onWishlist={onWishlist}
            onQuickView={onQuickView}
          />
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            沒有符合條件的商品
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            請嘗試調整篩選條件或搜尋其他關鍵字
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            aria-label="上一頁"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-9 min-w-9 px-3",
                page === currentPage && "bg-primary text-primary-foreground"
              )}
              onClick={() => onPageChange?.(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
            aria-label="下一頁"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page size selector */}
      {onPageSizeChange && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>每頁顯示</span>
          {[12, 24, 48].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onPageSizeChange(size)}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                pageSize === size
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

ProductShowcase.displayName = "ProductShowcase";
