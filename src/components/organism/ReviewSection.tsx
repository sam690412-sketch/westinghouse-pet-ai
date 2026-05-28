import { useState } from "react";
import { Star, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ReviewCard,
  type ReviewCardProps,
} from "@/components/molecule/ReviewCard";
import { Heading, Text } from "@/components/atomic/Typography";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface ReviewSectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Review items */
  reviews: ReviewItem[];
  /** Average rating (1-5) */
  averageRating?: number;
  /** Total review count */
  totalReviews?: number;
  /** Rating distribution { 5: count, 4: count, ... } */
  ratingDistribution?: Record<number, number>;
  /** Show rating breakdown */
  showBreakdown?: boolean;
  /** Filter options */
  filterOptions?: { label: string; value: string }[];
  /** Active filter */
  activeFilter?: string;
  /** Callback when filter changes */
  onFilterChange?: (filter: string) => void;
  /** Callback when review helpful clicked */
  onHelpful?: (reviewId: string) => void;
  /** Callback when write review clicked */
  onWriteReview?: () => void;
  /** Show write review button */
  showWriteButton?: boolean;
  /** Max reviews to show initially */
  maxInitial?: number;
}

export interface ReviewItem extends ReviewCardProps {
  id: string;
  helpfulCount?: number;
  isHelpfulClicked?: boolean;
}

/* ------------------------------------------------------------------ */
/*  DEFAULT DATA                                                       */
/* ------------------------------------------------------------------ */

const defaultFilterOptions = [
  { label: "全部", value: "all" },
  { label: "最新", value: "newest" },
  { label: "5 星", value: "5" },
  { label: "4 星", value: "4" },
  { label: "3 星", value: "3" },
  { label: "附照片", value: "with-photo" },
  { label: "已驗證購買", value: "verified" },
];

const defaultReviews: ReviewItem[] = [
  {
    id: "rev-001",
    author: "林小姐",
    avatarUrl: undefined,
    rating: 5,
    date: "2025-01-15",
    title: "貓咪終於愛喝水了！",
    content:
      "我家貓咪以前非常討厭喝水，自從換了這台飲水機之後，每天都會主動去喝好幾次。水流設計很安靜，晚上也不會吵。濾芯更換也很簡單，整體非常滿意！",
    verified: true,
    helpfulCount: 24,
  },
  {
    id: "rev-002",
    author: "陳先生",
    avatarUrl: undefined,
    rating: 5,
    date: "2025-01-10",
    title: "餵食器超級方便",
    content:
      "上班時最怕毛孩餓肚子，這台餵食器可以精準控制每次的份量，APP 操作直覺。最喜歡可以錄製語音呼叫功能，毛孩聽到我的聲音就會跑過去！",
    verified: true,
    helpfulCount: 18,
  },
  {
    id: "rev-003",
    author: "王太太",
    avatarUrl: undefined,
    rating: 4,
    date: "2024-12-28",
    title: "烘乾箱設計很貼心",
    content:
      "之前幫貓咪吹毛都要大戰半小時，現在放進去 20 分鐘就乾了。溫度很溫和不用擔心燙傷。唯一小缺點是體積比較大，建議先量好家裡空間。",
    verified: true,
    helpfulCount: 12,
  },
  {
    id: "rev-004",
    author: "黃小姐",
    avatarUrl: undefined,
    rating: 5,
    date: "2024-12-20",
    title: "冷暖寵物窩冬天必備",
    content:
      "冬天開暖氣模式，貓咪幾乎整天窩在裡面不出來。夏天也有冷氣模式，一年四季都實用。材質很好清潔，內墊可以拆下來水洗。",
    verified: true,
    helpfulCount: 9,
  },
  {
    id: "rev-005",
    author: "張先生",
    avatarUrl: undefined,
    rating: 4,
    date: "2024-12-15",
    title: "品質不錯但價位偏高",
    content:
      "產品做工很精緻，用料感覺很扎實，APP 功能也很完整。但以價格來說算是中高價位，如果是多寵物家庭可能要考慮預算。",
    verified: true,
    helpfulCount: 7,
  },
  {
    id: "rev-006",
    author: "李小姐",
    avatarUrl: undefined,
    rating: 5,
    date: "2024-12-08",
    title: "客服服務超級好",
    content:
      "一開始不會設定 Wi-Fi，打給客服人員很有耐心地一步一步教我，最後順利連上了。產品好用，後續服務也讓人很安心。",
    verified: true,
    helpfulCount: 15,
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function ReviewSection({
  title = "顧客真實評價",
  subtitle = "來自使用者的第一手心得",
  reviews = defaultReviews,
  averageRating = 4.7,
  totalReviews = 1286,
  ratingDistribution = { 5: 980, 4: 210, 3: 60, 2: 24, 1: 12 },
  showBreakdown = true,
  filterOptions = defaultFilterOptions,
  activeFilter = "all",
  onFilterChange,
  onHelpful,
  onWriteReview,
  showWriteButton = true,
  maxInitial = 6,
  className,
  ...props
}: ReviewSectionProps) {
  const [internalFilter, setInternalFilter] = useState(activeFilter);
  const [expanded, setExpanded] = useState(false);

  const effectiveFilter = onFilterChange ? activeFilter : internalFilter;

  const filtered = reviews.filter((r) => {
    switch (effectiveFilter) {
      case "all":
        return true;
      case "newest":
        return true; // Already sorted newest first
      case "with-photo":
        return false; // No photo data in default
      case "verified":
        return r.verified;
      case "5":
      case "4":
      case "3":
      case "2":
      case "1":
        return r.rating === parseInt(effectiveFilter);
      default:
        return true;
    }
  });

  const displayed = expanded ? filtered : filtered.slice(0, maxInitial);

  return (
    <section className={cn("px-4 py-10 lg:px-8", className)} {...props}>
      {/* Header */}
      <div className="mb-6 text-center md:mb-8">
        {title && (
          <div className="mb-2 flex items-center justify-center gap-2">
            <Star className="h-6 w-6 fill-pet-paw text-pet-paw" />
            <Heading as="h2" variant="h2">
              {title}
            </Heading>
          </div>
        )}
        {subtitle && (
          <Text variant="body" color="muted">
            {subtitle}
          </Text>
        )}
      </div>

      {/* Rating Summary */}
      {showBreakdown && (
        <div className="mx-auto mb-8 grid max-w-2xl grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
          {/* Left: Average */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.round(averageRating)
                      ? "fill-pet-paw text-pet-paw"
                      : "fill-neutral-200 text-neutral-200"
                  )}
                />
              ))}
            </div>
            <Text variant="bodySmall" color="muted" className="mt-1">
              共 {totalReviews.toLocaleString()} 則評價
            </Text>
          </div>

          {/* Right: Distribution */}
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] ?? 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-right text-muted-foreground">
                    {star}
                  </span>
                  <Star className="h-3.5 w-3.5 fill-pet-paw text-pet-paw" />
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {count > 0 ? `${Math.round(pct)}%` : "0%"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {filterOptions.map((opt) => {
          const isActive = effectiveFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setInternalFilter(opt.value);
                onFilterChange?.(opt.value);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-neutral-100 text-muted-foreground hover:bg-neutral-200"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayed.map((review) => (
          <ReviewCard
            key={review.id}
            {...review}
            onHelpful={() => onHelpful?.(review.id)}
          />
        ))}
      </div>

      {/* Load More */}
      {filtered.length > maxInitial && !expanded && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setExpanded(true)}
          >
            查看更多評價 ({filtered.length - maxInitial})
          </Button>
        </div>
      )}

      {/* Write Review CTA */}
      {showWriteButton && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-neutral-50 p-6 text-center">
          <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
          <div>
            <Text variant="body" weight="semibold">
              使用過我們的產品嗎？
            </Text>
            <Text variant="bodySmall" color="muted">
              分享您的使用心得，幫助其他飼主做出選擇
            </Text>
          </div>
          <Button onClick={onWriteReview} className="gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            撰寫評價
          </Button>
        </div>
      )}
    </section>
  );
}

ReviewSection.displayName = "ReviewSection";
