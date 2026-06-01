import { Star, Heart, ThumbsUp, BadgeCheck, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { REVIEWS, REVIEW_STATS } from "@/data/reviews";

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function ReviewsPage() {
  const avgRating = REVIEW_STATS.avgRating;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Back link */}
          <a
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首頁
          </a>

          <h1 className="text-3xl font-bold tracking-tight">顧客評價</h1>

          {/* Rating Summary */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground">{avgRating}</span>
              <span className="text-lg text-muted-foreground">/5</span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-6 w-6",
                      i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                來自 <span className="font-semibold text-foreground">{REVIEW_STATS.totalCount.toLocaleString()}+</span> 位真實飼主的評價
              </p>
            </div>

            <div className="hidden h-12 w-px bg-border sm:block" />

            <div className="flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-sm">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span className="font-medium">{REVIEW_STATS.fiveStarPercent}% 為 5 星評價</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            還在猶豫嗎？看看其他飼主的使用心得，為您的毛孩做出最好的選擇。
          </p>
          <a
            href="/products"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            瀏覽全部商品
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  REVIEW CARD                                                        */
/* ------------------------------------------------------------------ */

function ReviewCard({ review }: { review: (typeof REVIEWS)[number] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
              review.avatarColor || "bg-primary/10 text-primary"
            )}
          >
            {review.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">{review.name}</span>
              {review.verified && (
                <BadgeCheck className="h-3.5 w-3.5 text-blue-500" aria-label="已驗證" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">{review.date}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{review.scenario}</span>
      </div>

      {/* Product */}
      <div className="mt-2.5">
        <span className="rounded bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
          {review.product}
        </span>
      </div>

      {/* Rating */}
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
            )}
          />
        ))}
      </div>

      {/* Highlight */}
      {review.highlight && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
          <Heart className="h-3 w-3 fill-current" />
          {review.highlight}
        </div>
      )}

      {/* Content */}
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {review.content}
      </p>

      {/* Images indicator */}
      {review.images && review.images > 0 && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
          附上 {review.images} 張實拍照片
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <ThumbsUp className="h-3 w-3" />
          {review.likes} 人覺得有幫助
        </span>
        {review.recommend && (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
            推薦購買
          </span>
        )}
        {review.badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {review.badge}
          </span>
        )}
      </div>
    </div>
  );
}
