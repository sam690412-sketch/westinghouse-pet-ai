import { ShoppingCart, Tag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface BundleItem {
  name: string;
  price: number;
  image: string;
}

interface Bundle {
  id: string;
  name: string;
  items: BundleItem[];
  bundlePrice: number;
  originalPrice: number;
  savings: number;
  tag?: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  DATA — Product-specific bundles                                    */
/* ------------------------------------------------------------------ */

const BUNDLE_MAP: Record<string, Bundle[]> = {
  // M81 Feeder bundles
  "m81-fresh-food-feeder": [
    {
      id: "b-m81-1",
      name: "新手飼主入門組",
      items: [
        { name: "M81 鮮濕糧智慧餵食器", price: 598000, image: "/images/products/m81-01.webp" },
        { name: "D11-BA 智慧寵物飲水機", price: 248000, image: "/images/products/d11-ba-01.webp" },
      ],
      bundlePrice: 796000,
      originalPrice: 846000,
      savings: 50000,
      tag: "最熱銷",
      description: "餵食飲水一次搞定，新手飼主最佳選擇",
    },
  ],
  // M12 Feeder bundles
  "m12-panoramic-feeder": [
    {
      id: "b-m12-1",
      name: "全方位照護組",
      items: [
        { name: "M12 智慧全景餵食器", price: 328000, image: "/images/products/m12-01.webp" },
        { name: "D61 智慧不鏽鋼飲水機", price: 328000, image: "/images/products/d61-01.webp" },
      ],
      bundlePrice: 616000,
      originalPrice: 656000,
      savings: 40000,
      tag: "推薦組合",
      description: "餵食飲水雙效合一，給毛孩完整照護",
    },
  ],
  // M31 Feeder bundles
  "m31-gashapon-feeder": [
    {
      id: "b-m31-1",
      name: "趣味互動組",
      items: [
        { name: "M31 智慧扭蛋餵食器", price: 268000, image: "/images/products/m31-01.webp" },
        { name: "D11-BA 智慧寵物飲水機", price: 248000, image: "/images/products/d11-ba-01.webp" },
      ],
      bundlePrice: 496000,
      originalPrice: 516000,
      savings: 20000,
      description: "扭蛋造型可愛又有趣，貓咪最愛",
    },
  ],
  // D11BA Dispenser bundles
  "d11ba-water-dispenser": [
    {
      id: "b-d11ba-1",
      name: "飲水升級組",
      items: [
        { name: "D11-BA 智慧寵物飲水機", price: 248000, image: "/images/products/d11-ba-01.webp" },
        { name: "M12 智慧全景餵食器", price: 328000, image: "/images/products/m12-01.webp" },
      ],
      bundlePrice: 556000,
      originalPrice: 576000,
      savings: 20000,
      tag: "人氣組合",
      description: "飲水監控 + 精準餵食，全方位健康守護",
    },
  ],
  // D61 Dispenser bundles
  "d61-stainless-dispenser": [
    {
      id: "b-d61-1",
      name: "多貓家庭必備組",
      items: [
        { name: "D61 智慧不鏽鋼飲水機", price: 328000, image: "/images/products/d61-01.webp" },
        { name: "M81 鮮濕糧智慧餵食器", price: 598000, image: "/images/products/m81-01.webp" },
      ],
      bundlePrice: 896000,
      originalPrice: 926000,
      savings: 30000,
      tag: "多貓推薦",
      description: "4L 大容量飲水 + 鮮食餵食，多貓家庭最佳方案",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

interface BundleRecommendationSectionProps {
  currentSlug: string;
}

export function BundleRecommendationSection({ currentSlug }: BundleRecommendationSectionProps) {
  const bundles = BUNDLE_MAP[currentSlug] || [];
  if (bundles.length === 0) return null;

  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="bg-neutral-50 section-px section-py"
      aria-label="推薦組合"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div
          className={cn(
            "mb-10 text-center transition-all duration-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Text variant="overline" className="text-primary">
            BUNDLE DEAL
          </Text>
          <Heading as="h2" variant="h2" className="mt-2">
            加購更優惠
          </Heading>
          <Text variant="body" color="muted" className="mt-2">
            組合購買享折扣，一次滿足毛孩所有需求
          </Text>
        </div>

        {/* Bundles */}
        <div className="space-y-6">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  BUNDLE CARD                                                        */
/* ------------------------------------------------------------------ */

function BundleCard({ bundle, isVisible }: { bundle: Bundle; isVisible: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddBundle = async () => {
    for (const item of bundle.items) {
      await addItem(item.name, 1);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-card transition-all",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Tag Bar */}
      {bundle.tag && (
        <div className="flex items-center gap-2 bg-primary px-4 py-1.5">
          <Tag className="h-3.5 w-3.5 text-primary-foreground" />
          <span className="text-xs font-semibold text-primary-foreground">{bundle.tag}</span>
          <span className="ml-auto text-xs text-primary-foreground/80">
            省 NT${(bundle.savings / 100).toLocaleString()}
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Title */}
        <Heading as="h3" variant="h4">
          {bundle.name}
        </Heading>
        <Text variant="bodySmall" color="muted" className="mt-1">
          {bundle.description}
        </Text>

        {/* Items */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {bundle.items.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-neutral-50 p-3"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-14 w-14 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <Text variant="label" weight="semibold" className="line-clamp-1">
                  {item.name}
                </Text>
                <Text variant="caption" color="muted">
                  NT${(item.price / 100).toLocaleString()}
                </Text>
              </div>
            </div>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-border pt-5 sm:flex-row">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-primary">
              NT${(bundle.bundlePrice / 100).toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              NT${(bundle.originalPrice / 100).toLocaleString()}
            </span>
            <Badge variant="secondary" className="bg-error/10 text-error border-0">
              省 {(bundle.savings / 100).toLocaleString()} 元
            </Badge>
          </div>

          <Button
            size="lg"
            className="w-full gap-2 sm:w-auto"
            onClick={handleAddBundle}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                已加入購物車
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                一鍵加入組合
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
