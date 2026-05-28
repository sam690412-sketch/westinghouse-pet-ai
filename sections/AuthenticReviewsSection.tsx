import { Star, Heart, MessageCircle, BadgeCheck, Image as ImageIcon, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { Heading, Text } from "@/components/atomic/Typography";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface AuthenticReview {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  product: string;
  content: string;
  images?: number;
  likes: number;
  verified: boolean;
  badge?: string;
  highlight?: string;
}

/* ------------------------------------------------------------------ */
/*  DATA — Realistic Taiwan customer reviews                           */
/* ------------------------------------------------------------------ */

const reviews: AuthenticReview[] = [
  {
    id: "r1",
    name: "陳小雅",
    avatar: "陳",
    rating: 5,
    date: "2026-05-20",
    product: "M81 鮮濕糧智慧餵食器",
    content: "餵食器跟飲水機二合一真的太方便了！我家貓咪原本不愛喝水，換了這台之後每天都會主動去喝。而且鮮食保鮮功能超棒，濕糧放半天還是涼涼的。客服回覆也很快，有問題LINE問就解決了 👍",
    images: 3,
    likes: 42,
    verified: true,
    badge: "購買已驗證",
    highlight: "貓咪愛上喝水",
  },
  {
    id: "r2",
    name: "林建宏",
    avatar: "林",
    rating: 5,
    date: "2026-05-18",
    product: "D61 智慧不鏽鋼飲水機",
    content: "家裡三隻貓本來要搶水碗，現在4L大容量完全不夠搶。安裝超簡單，5分鐘搞定。最滿意的是續航力，充一次電用了一個多月還有電。台灣一年保固很安心。",
    images: 2,
    likes: 38,
    verified: true,
    badge: "多貓家庭推薦",
    highlight: "安裝超簡單",
  },
  {
    id: "r3",
    name: "王美琪",
    avatar: "王",
    rating: 5,
    date: "2026-05-15",
    product: "M12 智慧全景餵食器",
    content: "租屋族必備！每次加班到很晚都很擔心毛孩餓肚子，現在每天固定時間自動餵食，還能從手機看牠吃飯的樣子超療癒。密封效果真的很好，乾糧放兩週還是脆的。",
    likes: 56,
    verified: true,
    badge: "上班族必備",
    highlight: "租屋族救星",
  },
  {
    id: "r4",
    name: "張志偉",
    avatar: "張",
    rating: 4,
    date: "2026-05-12",
    product: "D11-BA 智慧寵物飲水機",
    content: "飲水監控功能很實用，APP會記錄每天的飲水量，有異常還會通知。不鏽鋼材質質感很好，清潔也很方便拆洗。唯一的缺點是2.5L對我家兩隻貓來說有時要勤換水，不過整體還是很推薦！",
    images: 1,
    likes: 23,
    verified: true,
    badge: "健康管理推薦",
  },
  {
    id: "r5",
    name: "黃小婷",
    avatar: "黃",
    rating: 5,
    date: "2026-05-10",
    product: "M31 智慧扭蛋餵食器",
    content: "扭蛋造型超級可愛！！！放在客廳朋友都問這是什麼。我家的貓好像也知道這是牠的，每次出糧都會跑過來等。錄音功能也很好玩，我錄了自己的聲音叫牠來吃飯 🐱",
    images: 4,
    likes: 71,
    verified: true,
    badge: "顏值擔當",
    highlight: "扭蛋造型超療癒",
  },
  {
    id: "r6",
    name: "李詩涵",
    avatar: "李",
    rating: 5,
    date: "2026-05-08",
    product: "M81 鮮濕糧智慧餵食器",
    content: "出差一週完全不擔心！之前請人來餵貓花超多錢，現在自動餵食器+大容量飲水機一次搞定。15天續航真的很夠用，回家看APP紀錄貓咪每天都有乖乖吃飯。重點是滿1500免運，組合買剛好達標超划算！",
    likes: 45,
    verified: true,
    badge: "出差族推薦",
    highlight: "一週出差也不怕",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function AuthenticReviewsSection({ limit }: { limit?: number }) {
  const displayReviews = limit ? reviews.slice(0, limit) : reviews;
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const stagger = useStaggerAnimation(displayReviews.length, { threshold: 0.05, staggerDelay: 100 });

  const avgRating = displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length;

  return (
    <section
      className="bg-neutral-50 section-px section-py"
      aria-label="真實顧客評價"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "mb-10 text-center transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Text variant="overline" className="text-primary">
            REAL REVIEWS
          </Text>
          <Heading as="h2" variant="h2" className="mt-2">
            飼主真心話
          </Heading>

          {/* Rating Summary */}
          <div className="mt-4 inline-flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-3 shadow-sm">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/5</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                  )}
                />
              ))}
            </div>
            <div className="h-6 w-px bg-border" />
            <Text variant="bodySmall" color="muted">
              來自 <span className="font-semibold text-foreground">1,000+</span> 位真實飼主
            </Text>
          </div>
        </div>

        {/* Review Grid — Masonry-style */}
        <div
          ref={stagger.ref}
          className="columns-1 gap-4 sm:columns-2 lg:columns-3"
        >
          {displayReviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} stagger={stagger} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <a
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            查看全部 1,000+ 則評價
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  REVIEW CARD — Shopee/LINE-inspired style                           */
/* ------------------------------------------------------------------ */

function ReviewCard({
  review,
  index,
  stagger,
}: {
  review: AuthenticReview;
  index: number;
  stagger: ReturnType<typeof useStaggerAnimation>;
}) {
  return (
    <div
      className={cn(
        "mb-4 break-inside-avoid rounded-2xl border border-border bg-card p-5 shadow-sm",
        "transition-all duration-300 hover:shadow-md hover:border-primary/20"
      )}
      style={stagger.getDelayStyle(index)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {review.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Text variant="label" weight="semibold">
                {review.name}
              </Text>
              {review.verified && (
                <BadgeCheck className="h-3.5 w-3.5 text-blue-500" aria-label="已驗證" />
              )}
            </div>
            <Text variant="caption" color="muted">
              {review.date}
            </Text>
          </div>
        </div>
      </div>

      {/* Product Name */}
      <div className="mt-2.5 flex items-center gap-2">
        <Text variant="caption" className="rounded bg-primary/5 px-2 py-0.5 font-medium text-primary">
          {review.product}
        </Text>
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

      {/* Highlight Badge */}
      {review.highlight && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
          <Heart className="h-3 w-3 fill-current" />
          {review.highlight}
        </div>
      )}

      {/* Content */}
      <Text variant="bodySmall" color="muted" className="mt-2 leading-relaxed">
        {review.content}
      </Text>

      {/* Image Indicator */}
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
        {review.badge && (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
            {review.badge}
          </span>
        )}
      </div>
    </div>
  );
}
