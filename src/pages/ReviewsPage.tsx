import { useState } from "react";
import { Star, Heart, ThumbsUp, BadgeCheck, ArrowLeft, X, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { REVIEWS, REVIEW_STATS } from "@/data/reviews";

/* ------------------------------------------------------------------ */
/*  LIGHTBOX MODAL                                                     */
/* ------------------------------------------------------------------ */

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  if (!images || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image */}
      <div
        className="relative max-h-[85vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index]}
          alt={`照片 ${index + 1}`}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
        />

        {/* Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === index ? "bg-white w-6" : "bg-white/40"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RECOMMENDATION CARD                                                */
/* ------------------------------------------------------------------ */

const RECOMMENDATIONS = [
  { slug: "m81-fresh-food-feeder", name: "M81 鮮濕糧智慧餵食器", image: "/images/products/card/m81-card.webp", tagline: "4°C鎖鮮+預熱出糧" },
  { slug: "m12-panoramic-feeder", name: "M12 智慧全景餵食器", image: "/images/products/card/m12-card.webp", tagline: "全景監控+大容量" },
  { slug: "m31-gashapon-feeder", name: "M31 智慧扭蛋餵食器", image: "/images/products/card/m31-card.webp", tagline: "扭蛋互動+防卡糧" },
  { slug: "d11ba-water-dispenser", name: "D11-BA 智慧寵物飲水機", image: "/images/products/card/d11-ba-card.webp", tagline: "喝水監控+四重過濾" },
  { slug: "d61-stainless-dispenser", name: "D61 智慧不鏽鋼飲水機", image: "/images/products/card/d61-card.webp", tagline: "全不鏽鋼+47天續航" },
];

function RecommendationSection() {
  return (
    <section className="w-full border-t border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-xl font-bold">推薦商品</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {RECOMMENDATIONS.map((item) => (
            <a
              key={item.slug}
              href={`/#/products/${item.slug}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-3 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-white">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-semibold leading-tight">{item.name}</span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">{item.tagline}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  REVIEW CARD                                                        */
/* ------------------------------------------------------------------ */

function ReviewCard({
  review,
  onPhotoClick,
}: {
  review: (typeof REVIEWS)[number];
  onPhotoClick: (photos: string[], index: number) => void;
}) {
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
                <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
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
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
          <Heart className="h-3 w-3 fill-current" />
          {review.highlight}
        </div>
      )}

      {/* Content */}
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {review.content}
      </p>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => onPhotoClick(review.photos!, i)}
              className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border transition-transform hover:scale-105 hover:border-primary/40"
            >
              <img
                src={photo}
                alt={`照片 ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <ThumbsUp className="h-3 w-3" />
          {review.likes} 人覺得有幫助
        </span>
        <div className="flex gap-2">
          {review.recommend && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function ReviewsPage() {
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const avgRating = REVIEW_STATS.avgRating;

  const handlePhotoClick = (photos: string[], index: number) => {
    setLightbox({ images: photos, index });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <a
            href="/#/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首頁
          </a>

          <h1 className="text-3xl font-bold tracking-tight">顧客評價</h1>

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
            <ReviewCard
              key={review.id}
              review={review}
              onPhotoClick={handlePhotoClick}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <RecommendationSection />

      {/* Bottom CTA */}
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-muted-foreground">
          還在猶豫嗎？看看其他飼主的使用心得，為您的毛孩做出最好的選擇。
        </p>
        <a
          href="/#/products"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <ShoppingCart className="h-4 w-4" />
          瀏覽全部商品
        </a>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
