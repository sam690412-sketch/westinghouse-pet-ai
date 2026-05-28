import { Star, ArrowRight, Quote } from "lucide-react";
import { useReviews } from "@/hooks/useCMS";
import { useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { SectionTitle } from "@/components/atomic/SectionTitle";
import { Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/atomic/RatingStars";

export function ReviewsSection() {
  const { data: reviews, isLoading } = useReviews(6);
  const stagger = useStaggerAnimation(reviews.length, { threshold: 0.1 });

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="px-6 py-16 sm:px-12 lg:px-20 lg:py-20" aria-label="顧客評價">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <SectionTitle
            title="飼主真心話"
            subtitle="超過 1,000+ 位飼主的真實使用心得"
            align="left"
          />
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/5</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <RatingStars rating={Math.round(avgRating)} size="sm" />
              <Text variant="caption" color="muted">
                {reviews.length} 則評價
              </Text>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div
              ref={stagger.ref}
              className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {reviews.map((review, i) => (
                <div
                  key={review.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
                  style={stagger.getDelayStyle(i)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {review.avatar_url ? (
                        <img
                          src={review.avatar_url}
                          alt={review.author_name}
                          className="h-9 w-9 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {review.author_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <Text variant="label" weight="semibold">
                          {review.author_name}
                        </Text>
                        {review.verified && (
                          <Text variant="caption" className="text-success">
                            已驗證購買
                          </Text>
                        )}
                      </div>
                    </div>
                    <Quote className="h-5 w-5 text-muted-foreground/30" aria-hidden="true" />
                  </div>

                  {/* Rating */}
                  <RatingStars rating={review.rating} size="sm" />

                  {/* Content */}
                  <Text variant="label" weight="semibold">
                    {review.title}
                  </Text>
                  <Text variant="bodySmall" color="muted" className="line-clamp-3 flex-1">
                    {review.content}
                  </Text>

                  {/* Product link */}
                  {review.product_slug && (
                    <a
                      href={`/products/${review.product_slug}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Star className="h-3 w-3" />
                      查看相關產品
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button variant="outline" className="gap-2" asChild>
                <a href="/reviews">
                  查看全部評價
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
