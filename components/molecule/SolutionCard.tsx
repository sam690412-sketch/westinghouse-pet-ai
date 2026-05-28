import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text, Heading } from "@/components/atomic/Typography";
import { forwardRef } from "react";

export interface SolutionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  articleCount?: number;
  productCount?: number;
  onSelect?: (slug: string) => void;
  variant?: "default" | "compact" | "featured";
}

export const SolutionCard = forwardRef<HTMLDivElement, SolutionCardProps>(
  ({
    slug,
    title,
    description,
    imageUrl,
    icon,
    articleCount,
    productCount,
    onSelect,
    variant = "default",
    className,
    ...props
  }, ref) => {
    const handleClick = () => onSelect?.(slug);

    if (variant === "compact") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          onClick={handleClick}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary",
            className
          )}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Text variant="label" weight="semibold" className="line-clamp-1">
              {title}
            </Text>
            <Text variant="caption" color="muted" className="line-clamp-1">
              {description}
            </Text>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      );
    }

    if (variant === "featured") {
      return (
        <div
          ref={ref}
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover",
            className
          )}
          {...props}
        >
          <div className="relative aspect-video overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                {icon && <div className="text-primary">{icon}</div>}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <Heading variant="h4" color="white" className="mb-1">
                {title}
              </Heading>
              <Text variant="bodySmall" color="white" className="line-clamp-2 opacity-90">
                {description}
              </Text>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              {articleCount !== undefined && (
                <Text variant="caption" color="muted">
                  {articleCount} 篇文章
                </Text>
              )}
              {productCount !== undefined && (
                <Text variant="caption" color="muted">
                  {productCount} 款產品
                </Text>
              )}
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              了解詳情
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover",
          className
        )}
        {...props}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              {icon && <div className="scale-150 text-primary">{icon}</div>}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <Heading variant="h5" className="mb-1.5 line-clamp-1">
            {title}
          </Heading>
          <Text variant="bodySmall" color="muted" className="mb-3 line-clamp-2 flex-1">
            {description}
          </Text>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {articleCount !== undefined && (
                <Text variant="caption" color="muted">{articleCount} 篇文章</Text>
              )}
              {productCount !== undefined && (
                <Text variant="caption" color="muted">{productCount} 款產品</Text>
              )}
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              了解詳情
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);
SolutionCard.displayName = "SolutionCard";
