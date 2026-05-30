import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";
import {
  ProductHeroSection,
  ProductFeaturesSection,
  ProductSpecsSection,
  ProductFAQSection,
  UrgencyBanner,
  BundleRecommendationSection,
  WhyChooseUsSection,
} from "@/sections";
import { useProduct } from "@/hooks/useCMS";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/atomic/PriceDisplay";
import {
  Cat,
  Dog,
  Users,
  Smartphone,
  Thermometer,
  Camera,
  Eye,
  Mic,
  Sparkles,
  Utensils,
  Droplets,
  VolumeX,
  Shield,
  CheckCircle,
  Truck,
  CreditCard,
  Clock,
  MessageCircle,
  Wrench,
  Headphones,
  Award,
  HeartHandshake,
  ShoppingCart,
} from "lucide-react";

/* ================================================================ */
/*  DATA MAPS                                                        */
/* ================================================================ */

const DETAIL_IMAGE_MAP: Record<string, string> = {
  "m81-fresh-food-feeder": "/images/products/detail/m81-detail.webp",
  "m12-panoramic-feeder": "/images/products/detail/m12-detail.webp",
  "m31-gashapon-feeder": "/images/products/detail/m31-detail.webp",
  "d11ba-water-dispenser": "/images/products/detail/d11-ba-detail.webp",
  "d61-stainless-dispenser": "/images/products/detail/d61-detail.webp",
};

const PET_TAGS_MAP: Record<string, string[]> = {
  "m81-fresh-food-feeder": ["貓咪", "小型犬", "多寵家庭"],
  "m12-panoramic-feeder": ["貓咪", "小型犬", "中型犬", "多寵家庭"],
  "m31-gashapon-feeder": ["貓咪", "小型犬"],
  "d11ba-water-dispenser": ["貓咪", "小型犬", "中型犬", "多寵家庭"],
  "d61-stainless-dispenser": ["貓咪", "小型犬", "中型犬", "多寵家庭"],
};

interface HighlightItem {
  icon: React.ReactNode;
  label: string;
}

const HIGHLIGHTS_MAP: Record<string, HighlightItem[]> = {
  "m81-fresh-food-feeder": [
    { icon: <Utensils className="h-6 w-6" />, label: "鮮濕糧分離" },
    { icon: <Smartphone className="h-6 w-6" />, label: "APP控制" },
    { icon: <Thermometer className="h-6 w-6" />, label: "25°C恆溫鮮食" },
    { icon: <Camera className="h-6 w-6" />, label: "攝影鏡頭" },
  ],
  "m12-panoramic-feeder": [
    { icon: <Eye className="h-6 w-6" />, label: "全景監控" },
    { icon: <Smartphone className="h-6 w-6" />, label: "APP控制" },
    { icon: <Sparkles className="h-6 w-6" />, label: "大容量" },
    { icon: <Mic className="h-6 w-6" />, label: "雙向語音" },
  ],
  "m31-gashapon-feeder": [
    { icon: <Sparkles className="h-6 w-6" />, label: "扭蛋互動" },
    { icon: <Smartphone className="h-6 w-6" />, label: "APP控制" },
    { icon: <Utensils className="h-6 w-6" />, label: "不鏽鋼食盆" },
    { icon: <CheckCircle className="h-6 w-6" />, label: "防卡糧" },
  ],
  "d11ba-water-dispenser": [
    { icon: <Droplets className="h-6 w-6" />, label: "2.5L容量" },
    { icon: <Shield className="h-6 w-6" />, label: "四重過濾" },
    { icon: <VolumeX className="h-6 w-6" />, label: "靜音循環" },
    { icon: <Utensils className="h-6 w-6" />, label: "304不鏽鋼碗" },
  ],
  "d61-stainless-dispenser": [
    { icon: <Utensils className="h-6 w-6" />, label: "全不鏽鋼" },
    { icon: <Shield className="h-6 w-6" />, label: "抗菌材質" },
    { icon: <Droplets className="h-6 w-6" />, label: "多重過濾" },
    { icon: <VolumeX className="h-6 w-6" />, label: "超靜音" },
  ],
};

const COMPARISON_DATA = {
  headers: ["", "M81", "M12", "M31"],
  rows: [
    { label: "容量", values: ["4L", "4L", "3L"] },
    { label: "APP控制", values: ["✓", "✓", "✓"] },
    { label: "攝影機", values: ["300°旋轉", "全景", "—"] },
    { label: "鮮食功能", values: ["✓ 鎖鮮+預熱", "—", "—"] },
    { label: "雙向語音", values: ["✓", "✓", "—"] },
  ],
};

const LIFESTYLE_IMAGE_MAP: Record<string, string> = {
  "m81-fresh-food-feeder": "/images/products/m81-lifestyle.jpg",
  "m12-panoramic-feeder": "/images/products/m12-lifestyle.jpg",
  "m31-gashapon-feeder": "/images/products/m31-lifestyle.jpg",
  "d11ba-water-dispenser": "/images/products/d11ba-lifestyle.jpg",
  "d61-stainless-dispenser": "/images/products/d61-lifestyle.jpg",
};

const SEO_MAP: Record<string, { title: string; description: string }> = {
  "m81-fresh-food-feeder": {
    title: "M81 鮮濕糧智慧餵食器 | Westinghouse Pet 台灣官方",
    description:
      "M81 鮮濕糧智慧餵食器，4°C鎖鮮保存、25°C預熱出糧、300°旋轉攝影機。支援鮮食與乾糧混合，APP遠端操控。Westinghouse Pet 台灣官方旗艦店，一年保固。",
  },
  "m12-panoramic-feeder": {
    title: "M12 智慧全景餵食器 | Westinghouse Pet 台灣官方",
    description:
      "M12 智慧全景餵食器，全景攝影機免費看回放，4L大容量，24小時動態跟蹤。適合多貓家庭。Westinghouse Pet 台灣官方旗艦店。",
  },
  "m31-gashapon-feeder": {
    title: "M31 智慧扭蛋餵食器 | Westinghouse Pet 台灣官方",
    description:
      "M31 智慧扭蛋餵食器，3L黃金容量，扭蛋機外觀設計，各種乾糧適配不卡糧。Westinghouse Pet 台灣官方旗艦店。",
  },
  "d11ba-water-dispenser": {
    title: "D11-BA 智慧寵物飲水機 | Westinghouse Pet 台灣官方",
    description:
      "D11-BA 智慧寵物飲水機，2.5L大容量，四重過濾，寵物喝水量監控，缺水簡訊提醒。Westinghouse Pet 台灣官方旗艦店。",
  },
  "d61-stainless-dispenser": {
    title: "D61 智慧不鏽鋼寵物飲水機 | Westinghouse Pet 台灣官方",
    description:
      "D61 智慧不鏽鋼寵物飲水機，食品級304不鏽鋼，4L超大容量，47天長續航。Westinghouse Pet 台灣官方旗艦店。",
  },
};

/* ================================================================ */
/*  HELPER COMPONENTS                                                */
/* ================================================================ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading: loading, error } = useProduct(slug || "");
  const { addItem } = useCart();

  /* ---- SEO ---- */
  useEffect(() => {
    if (!product) return;
    const seo = SEO_MAP[product.slug];
    if (seo) {
      document.title = seo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", seo.description);
      else {
        const m = document.createElement("meta");
        m.name = "description";
        m.content = seo.description;
        document.head.appendChild(m);
      }
      /* Open Graph */
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", seo.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", seo.description);
      if (product.hero_image_url) {
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg) ogImg.setAttribute("content", product.hero_image_url);
      }
    }
    /* JSON-LD */
    const existing = document.getElementById("jsonld-product");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "jsonld-product";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: product.hero_image_url || undefined,
      description: product.short_description || undefined,
      sku: product.sku || undefined,
      brand: { "@type": "Brand", name: "Westinghouse Pet" },
      offers: {
        "@type": "Offer",
        url: typeof window !== "undefined" ? window.location.href : undefined,
        priceCurrency: "TWD",
        price: product.price ? (product.price / 100).toString() : undefined,
        availability:
          product.stock_status === "in_stock"
            ? "https://schema.org/InStock"
            : product.stock_status === "low_stock"
              ? "https://schema.org/LimitedAvailability"
              : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "Westinghouse Pet Taiwan" },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "TWD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "TW",
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/ReturnShippingFees",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "128",
      },
    });
    document.head.appendChild(script);
    return () => {
      const s = document.getElementById("jsonld-product");
      if (s) s.remove();
    };
  }, [product]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold">找不到此商品</h1>
        <p className="mt-2 text-muted-foreground">此商品可能已下架或連結不正確。</p>
        <a href="/products" className="mt-4 text-primary hover:underline">瀏覽全部商品</a>
      </div>
    );
  }

  /* ---- derived data ---- */
  const petTags = PET_TAGS_MAP[product.slug] || [];
  const highlights = HIGHLIGHTS_MAP[product.slug] || [];
  const detailImg = DETAIL_IMAGE_MAP[product.slug];
  const lifestyleImg = LIFESTYLE_IMAGE_MAP[product.slug];
  const showComparison = ["m81-fresh-food-feeder", "m12-panoramic-feeder", "m31-gashapon-feeder"].includes(product.slug);

  /* ---- handlers ---- */
  const handleAddToCart = () => {
    if (product.sku) addItem(product.sku, 1);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  return (
    <>
      <UrgencyBanner stockStatus={product.stock_status} />

      {/* Breadcrumb */}
      <nav aria-label="麵包屑" className="mx-auto max-w-7xl px-6 py-3 text-sm text-muted-foreground sm:px-12 lg:px-20">
        <ol className="flex items-center gap-2">
          <li><a href="/" className="hover:text-foreground">首頁</a></li>
          <li>/</li>
          <li><a href="/products" className="hover:text-foreground">全部商品</a></li>
          <li>/</li>
          <li className="text-foreground" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* ====== Hero ====== */}
      <ProductHeroSection product={product} />

      {/* ====== 區塊2: 產品亮點摘要 ====== */}
      {highlights.length > 0 && (
        <section className="w-full bg-muted/30 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle>產品亮點</SectionTitle>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {h.icon}
                  </div>
                  <span className="text-sm font-semibold">{h.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== 區塊1: 毛孩適合族群 ====== */}
      {petTags.length > 0 && (
        <section className="w-full py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionTitle>適合誰？</SectionTitle>
            <div className="flex flex-wrap justify-center gap-4">
              {petTags.map((tag, i) => {
                const Icon =
                  tag === "貓咪" ? Cat :
                  tag === "小型犬" ? Dog :
                  tag === "中型犬" ? Dog :
                  Users;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    {tag}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ====== Features / Specs / FAQ ====== */}
      {product.features && product.features.length > 0 && (
        <ProductFeaturesSection features={product.features} />
      )}

      {product.specs && product.specs.length > 0 && (
        <ProductSpecsSection specs={product.specs} />
      )}

      {/* ====== 區塊4: 使用情境 ====== */}
      {lifestyleImg && (
        <section className="w-full bg-muted/30 py-12">
          <div className="mx-auto max-w-[960px] px-4 sm:px-6">
            <SectionTitle>使用情境</SectionTitle>
            <img
              src={lifestyleImg}
              alt={`${product.name} 使用情境`}
              className="w-full rounded-2xl object-contain shadow-sm"
              loading="lazy"
            />
          </div>
        </section>
      )}

      {/* ====== 區塊3: 產品比較表 ====== */}
      {showComparison && (
        <section className="w-full py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionTitle>產品比較</SectionTitle>
            <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    {COMPARISON_DATA.headers.map((h, i) => (
                      <th key={i} className="px-4 py-3 text-center font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className={ri % 2 === 0 ? "bg-card" : "bg-muted/30"}
                    >
                      <td className="px-4 py-3 font-medium">{row.label}</td>
                      {row.values.map((v, ci) => (
                        <td key={ci} className="px-4 py-3 text-center">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {product.faq_items && product.faq_items.length > 0 && (
        <ProductFAQSection faqItems={product.faq_items} />
      )}

      {/* ====== 產品詳細介紹 ====== */}
      {detailImg && (
        <section className="w-full py-12">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <SectionTitle>產品詳細介紹</SectionTitle>
            <img
              src={detailImg}
              alt={`${product.name} 詳細介紹`}
              className="w-full object-contain"
              loading="lazy"
            />
          </div>
        </section>
      )}

      {/* ====== 區塊5: 保固與售後 ====== */}
      <section className="w-full bg-muted/30 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionTitle>保固與售後</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[
              { icon: <Award className="h-6 w-6" />, label: "台灣公司貨" },
              { icon: <Shield className="h-6 w-6" />, label: "一年保固" },
              { icon: <Wrench className="h-6 w-6" />, label: "原廠零件供應" },
              { icon: <Headphones className="h-6 w-6" />, label: "LINE客服支援" },
              { icon: <HeartHandshake className="h-6 w-6" />, label: "維修服務" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 區塊6: 購買信任區 ====== */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionTitle>購物安心保障</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: <Clock className="h-6 w-6" />, label: "7天鑑賞期" },
              { icon: <Truck className="h-6 w-6" />, label: "滿額免運" },
              { icon: <CreditCard className="h-6 w-6" />, label: "安全付款" },
              { icon: <CheckCircle className="h-6 w-6" />, label: "快速出貨" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
              >
                <span className="text-primary">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 區塊8: 轉換率 CTA ====== */}
      <section className="w-full bg-primary py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-primary-foreground">
            為毛孩準備最好的
          </h2>
          <p className="mb-6 text-primary-foreground/80">
            {product.name} — 現貨供應中，今天下單 1-3 天到貨
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={handleBuyNow}
              className="gap-2 bg-white text-primary hover:bg-white/90"
            >
              <ShoppingCart className="h-5 w-5" />
              立即購買
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleAddToCart}
              className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ShoppingCart className="h-5 w-5" />
              加入購物車
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open("https://lin.ee/xxxxxx", "_blank")}
              className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <MessageCircle className="h-5 w-5" />
              LINE 諮詢
            </Button>
          </div>
          {product.price && (
            <div className="mt-4 text-xl font-bold text-primary-foreground">
              <PriceDisplay price={product.price} size="lg" />
            </div>
          )}
        </div>
      </section>

      <BundleRecommendationSection currentSlug={product.slug} />
      <WhyChooseUsSection />
    </>
  );
}
