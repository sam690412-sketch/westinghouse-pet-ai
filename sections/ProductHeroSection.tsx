import { ShoppingCart, Zap, Truck, ShieldCheck, Award, AlertTriangle, Check, RotateCcw, Cat, Clock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CMSProduct } from "@/types/cms";
import { PriceDisplay } from "@/components/atomic/PriceDisplay";
import { StockStatus } from "@/components/atomic/StockStatus";
import { RatingStars } from "@/components/atomic/RatingStars";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantitySelector } from "@/components/atomic/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

interface ProductHeroSectionProps {
  product: CMSProduct;
}

/** Scenario badges by product slug */
const productScenarios: Record<string, { for: string; scene: string; bundle: string }> = {
  "m81-fresh-food-feeder": {
    for: "餵食鮮食/混糧的毛孩",
    scene: "經常出差、加班的飼主",
    bundle: "d11ba-water-dispenser",
  },
  "m12-panoramic-feeder": {
    for: "多貓家庭、需要監控的飼主",
    scene: "希望隨時看見毛孩的上班族",
    bundle: "d11ba-water-dispenser",
  },
  "m31-gashapon-feeder": {
    for: "喜歡互動玩耍的貓咪",
    scene: "想讓餵食變有趣的飼主",
    bundle: "d11ba-water-dispenser",
  },
  "d11ba-water-dispenser": {
    for: "不愛喝水的貓咪、腎貓",
    scene: "關注毛孩飲水健康的飼主",
    bundle: "m81-fresh-food-feeder",
  },
  "d61-stainless-dispenser": {
    for: "追求抗菌安全的飼主",
    scene: "醫療級材質需求的敏感體質貓",
    bundle: "m81-fresh-food-feeder",
  },
};

export function ProductHeroSection({ product }: ProductHeroSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem, isLoading: cartLoading, error: cartError } = useCart();

  const isOutOfStock = product.stock_status === "out_of_stock";
  const isLowStock = product.stock_status === "low_stock";
  const isPreorder = product.stock_status === "pre_order";

  const galleryImages: { url: string; alt: string }[] = [];
  if (product.hero_image_url) galleryImages.push({ url: product.hero_image_url, alt: product.name });
  // @ts-ignore — some products have lifestyle images via CMS
  if ((product as Record<string, unknown>).lifestyle_image_url) galleryImages.push({ url: String((product as Record<string, unknown>).lifestyle_image_url), alt: `${product.name} 情境圖` });
  if (galleryImages.length === 0) galleryImages.push({ url: "/images/placeholder-product.jpg", alt: product.name });

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const scenario = productScenarios[product.slug];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10" aria-label="商品資訊">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-neutral-100">
            <img
              src={galleryImages[selectedImage]?.url || "/images/placeholder-product.jpg"}
              alt={galleryImages[selectedImage]?.alt || product.name}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {discount > 0 && <Badge className="bg-red-500 text-white border-0 text-xs">-{discount}%</Badge>}
              {isPreorder && <Badge className="bg-amber-500 text-white border-0 text-xs">預購</Badge>}
              {isLowStock && <Badge className="bg-amber-500 text-white border-0 text-xs">少量現貨</Badge>}
            </div>
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                    i === selectedImage ? "border-primary" : "border-border hover:border-primary/50"
                  )}
                  aria-label={`圖片 ${i + 1}`}
                >
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category */}
          <Text variant="overline" className="text-primary text-xs">
            {product.category === "feeder" ? "智能餵食系列" : product.category === "water_dispenser" ? "循環飲水系列" : "寵物智能配件"}
          </Text>

          {/* Name */}
          <Heading as="h1" variant="h2" className="mt-1 text-xl sm:text-2xl lg:text-3xl">
            {product.name}
          </Heading>

          {/* Tagline */}
          {product.tagline && (
            <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
          )}

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={4.8} reviewCount={128} size="sm" />
          </div>

          {/* Price — HIGH VISIBILITY */}
          <div className="mt-4 flex items-baseline gap-3">
            <PriceDisplay price={product.price} originalPrice={product.compare_at_price ?? undefined} size="lg" showDiscount />
          </div>

          {/* Stock + Shipping */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <StockStatus status={product.stock_status} />
            {isLowStock && (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <AlertTriangle className="h-3 w-3" />
                僅剩 {product.stock_quantity} 件
              </span>
            )}
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              滿 NT$1,500 免運
            </span>
          </div>

          {/* ===== CTA — PRIMARY, HIGH, STRONG ===== */}
          <div className="mt-5 space-y-3">
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <Text variant="label" className="text-xs shrink-0">數量</Text>
                <QuantitySelector value={quantity} onChange={setQuantity} max={isLowStock ? product.stock_quantity : 99} />
              </div>
            )}

            {cartError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {cartError}
              </div>
            )}

            {added && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
                <Check className="h-4 w-4 shrink-0" />
                已加入購物車
              </div>
            )}

            {/* PRIMARY CTA */}
            <Button
              size="lg"
              className="w-full gap-2 bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] text-base font-semibold h-12"
              disabled={isOutOfStock || cartLoading}
              onClick={async () => {
                try { await addItem(product.sku, quantity); setAdded(true); setTimeout(() => setAdded(false), 2000); }
                catch { /* error via cartError */ }
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock ? "暫時缺貨" : isPreorder ? "立即預購" : "先幫毛孩準備"}
            </Button>

            {/* SECONDARY CTA */}
            {!isOutOfStock && (
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 h-12 text-base border-primary/30 text-primary hover:bg-primary/5"
                onClick={async () => {
                  try { await addItem(product.sku, quantity); window.location.href = "#/checkout"; }
                  catch { /* error */ }
                }}
              >
                <Zap className="h-5 w-5" />
                直接帶回家
              </Button>
            )}
          </div>

          {/* Trust bar — compact */}
          <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg border border-border bg-neutral-50 p-3">
            {[
              { icon: ShieldCheck, label: "一年保固" },
              { icon: RotateCcw, label: "15天試用" },
              { icon: Award, label: "正版授權" },
              { icon: Clock, label: "快速出貨" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-center">
                <b.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground leading-tight">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Scenario: 適合哪種毛孩 */}
          {scenario && (
            <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs font-medium text-primary mb-1.5">適合誰？</p>
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Cat className="h-3 w-3 text-primary/70" />
                  {scenario.for}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3 text-primary/70" />
                  {scenario.scene}
                </p>
              </div>
            </div>
          )}

          {/* SKU */}
          <Text variant="caption" color="muted" className="mt-3">
            SKU: {product.sku}
          </Text>
        </div>
      </div>
    </section>
  );
}
