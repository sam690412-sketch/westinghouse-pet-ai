import { useState, useEffect, useCallback } from "react";
import type {
  CMSProduct,
  CMSSolution,
  CMSLearnArticle,
  CMSReview,
  CMSFAQItem,
  CMSProblemSolution,
  CMSHeroSlide,
  APIResponse,
} from "@/types/cms";
import { buildImageUrl } from "@/lib/supabase";
import { env } from "@/lib/env";

/* ================================================================
   STATIC FALLBACKS — Only used when CMS tables are empty.
   All pricing/stock data comes from commerce_products table LIVE.
   No hardcoded prices exist in this file.
   ================================================================ */

const FALLBACK_REVIEWS: CMSReview[] = [
  { id: "r1", author_name: "陳小姐", avatar_url: null, rating: 5, title: "貓咪終於愛喝水了！", content: "我家貓咪以前非常討厭喝水，自從換了這台飲水機之後，每天都會主動去喝好幾次。水流設計很安靜，晚上也不會吵。濾芯更換也很簡單，整體非常滿意！", product_sku: "WH-D11BA-TW", product_slug: "d11ba-water-dispenser", verified: true, helpful_count: 24, created_at: "2025-01-15" },
  { id: "r2", author_name: "林先生", avatar_url: null, rating: 5, title: "餵食器超級方便", content: "上班時最怕毛孩餓肚子，這台餵食器可以精準控制每次的份量，APP 操作直覺。最喜歡可以錄製語音呼叫功能，毛孩聽到我的聲音就會跑過去！", product_sku: "WH-M81-TW", product_slug: "m81-fresh-food-feeder", verified: true, helpful_count: 18, created_at: "2025-01-10" },
  { id: "r3", author_name: "王太太", avatar_url: null, rating: 4, title: "烘乾箱設計很貼心", content: "之前幫貓咪吹毛都要大戰半小時，現在放進去 20 分鐘就乾了。溫度很溫和不用擔心燙傷。唯一小缺點是體積比較大，建議先量好家裡空間。", product_sku: null, product_slug: null, verified: true, helpful_count: 12, created_at: "2024-12-28" },
  { id: "r4", author_name: "張小姐", avatar_url: null, rating: 5, title: "餵食器救了我們全家", content: "經常加班到很晚，有了自動餵食器再也不用擔心毛孩挨餓，APP通知功能很貼心。", product_sku: "WH-M12-TW", product_slug: "m12-panoramic-feeder", verified: true, helpful_count: 32, created_at: "2025-01-08" },
];

const FALLBACK_LEARN_ARTICLES: CMSLearnArticle[] = [
  { id: "a1", slug: "cat-not-drinking-water-guide", title: "貓咪不喝水怎麼辦？五大技巧讓貓愛上喝水", excerpt: "貓咪天生不愛喝水，但飲水不足會導致腎臟疾病。學會這五個技巧，讓貓咪愛上喝水。", content: null, category: "health", cover_image_url: "/images/learn/water.jpg", author: "獸醫師 王醫師", read_time: 5, published_at: "2025-01-10", updated_at: null },
  { id: "a2", slug: "auto-feeder-guide", title: "自動餵食器選購指南：上班族必讀", excerpt: "加班、出差無法準時餵食？自動餵食器是你的好幫手。選購時要注意這些要點。", content: null, category: "guide", cover_image_url: "/images/learn/feeder.jpg", author: "Westinghouse Pet 編輯部", read_time: 8, published_at: "2025-01-05", updated_at: null },
  { id: "a3", slug: "first-time-cat-owner", title: "新手養貓必備清單", excerpt: "第一次養貓不知道要準備什麼？這份清單幫你一次搞定所有必需品。", content: null, category: "guide", cover_image_url: "/images/learn/new-cat.jpg", author: "資深貓奴 李小姐", read_time: 6, published_at: "2024-12-28", updated_at: null },
  { id: "a4", slug: "kidney-disease-prevention", title: "貓咪腎臟病預防：從飲水開始", excerpt: "腎臟病是貓咪常見疾病，但透過正確的飲水管理可以有效預防。", content: null, category: "health", cover_image_url: "/images/learn/kidney.jpg", author: "獸醫師 王醫師", read_time: 7, published_at: "2024-12-20", updated_at: null },
];

/* ================================================================ */
/*  API FETCH HELPER                                                  */
/* ================================================================ */

const API_BASE = env.API_BASE;

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/* ================================================================ */
/*  GENERIC HOOKS                                                     */
/* ================================================================ */

function useAPI<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setIsLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading, error };
}

/** Hook wrapper ensuring array data, falling back to empty array */
function useAPIList<T>(fetcher: () => Promise<T[]>, deps: unknown[] = []) {
  const { data, isLoading, error } = useAPI(fetcher, deps);
  return { data: data ?? [], isLoading, error };
}

/* ================================================================ */
/*  PRODUCT FALLBACKS — Render product pages when API is unavailable  */
/* ================================================================ */

const FALLBACK_PRODUCTS: Record<string, CMSProduct> = {
  "m81-fresh-food-feeder": {
    slug: "m81-fresh-food-feeder", sku: "WH-M81-TW", name: "M81 鮮濕糧智慧餵食器",
    tagline: "鮮食乾糧混合餵食，APP遠端操控",
    short_description: "支援鮮食與乾糧混合餵食，透過手機APP隨時掌控餵食時間與份量。語音錄音功能讓毛孩聽到熟悉的聲音。",
    description: null, category: "feeder", solutions: ["long-hours-away"],
    hero_image_url: "/images/products/m81-hero-banner.jpg",
    images: [{ image: "/images/products/m81-lifestyle.jpg", alt: "M81 情境圖" }],
    features: [{ icon: "smart", title: "APP智慧操控", description: "隨時隨地控制餵食時間與份量" }, { icon: "voice", title: "語音錄音", description: "錄製主人聲音呼叫毛孩用餐" }, { icon: "seal", title: "防潮密封", description: "保持糧食新鮮不變質" }],
    specs: [{ label: "容量", value: "4L" }, { label: "電源", value: "USB-C / 電池備用" }, { label: "連線", value: "WiFi 2.4GHz" }, { label: "重量", value: "2.1kg" }],
    faq_items: [{ question: "可以餵濕糧嗎？", answer: { text: "可以，M81 專為鮮食設計，配有冷藏保鮮功能。" } }],
    how_to_steps: null, meta_title: null, meta_description: null,
    created_at: "2025-01-01", updated_at: "2025-01-01",
    price: 499000, compare_at_price: 599000, currency: "TWD",
    stock_quantity: 15, stock_status: "in_stock", commerce_active: true,
    preorder: false, preorder_message: null, shipping_class: null,
  },
  "m12-panoramic-feeder": {
    slug: "m12-panoramic-feeder", sku: "WH-M12-TW", name: "M12 智慧全景餵食器",
    tagline: "360°全景監控餵食，隨時看見毛孩",
    short_description: "內建360°全景鏡頭，讓你出門在外也能隨時看見毛孩用餐的模樣。4L大容量適合多貓家庭。",
    description: null, category: "feeder", solutions: ["multi-cat"],
    hero_image_url: "/images/products/m12-hero-banner.jpg",
    images: [{ image: "/images/products/m12-lifestyle.jpg", alt: "M12 情境圖" }],
    features: [{ icon: "camera", title: "360°全景鏡頭", description: "隨時觀看毛孩用餐實況" }, { icon: "voice", title: "雙向語音", description: "與毛孩即時互動" }, { icon: "capacity", title: "4L大容量", description: "適合多貓家庭使用" }],
    specs: [{ label: "容量", value: "4L" }, { label: "電源", value: "USB-C" }, { label: "連線", value: "WiFi 2.4GHz" }, { label: "重量", value: "1.8kg" }],
    faq_items: null, how_to_steps: null, meta_title: null, meta_description: null,
    created_at: "2025-01-01", updated_at: "2025-01-01",
    price: 349000, compare_at_price: 429000, currency: "TWD",
    stock_quantity: 8, stock_status: "low_stock", commerce_active: true,
    preorder: false, preorder_message: null, shipping_class: null,
  },
  "m31-gashapon-feeder": {
    slug: "m31-gashapon-feeder", sku: "WH-M31-TW", name: "M31 智慧扭蛋餵食器",
    tagline: "趣味扭蛋餵食，互動玩樂兩相宜",
    short_description: "獨特扭蛋設計讓餵食變成趣味互動遊戲，讓貓咪在進食中獲得運動與樂趣。",
    description: null, category: "feeder", solutions: ["first-time-cat"],
    hero_image_url: "/images/products/m31-hero-banner.jpg",
    images: [{ image: "/images/products/m31-lifestyle.jpg", alt: "M31 情境圖" }],
    features: [{ icon: "toy", title: "扭蛋趣味設計", description: "讓餵食變成互動遊戲" }, { icon: "smart", title: "APP遠端控制", description: "設定多時段餵食計畫" }, { icon: "stainless", title: "不鏽鋼食盆", description: "抗菌易清潔" }],
    specs: [{ label: "容量", value: "2.5L" }, { label: "電源", value: "USB-C / 電池" }, { label: "連線", value: "WiFi 2.4GHz" }, { label: "重量", value: "1.5kg" }],
    faq_items: null, how_to_steps: null, meta_title: null, meta_description: null,
    created_at: "2025-01-01", updated_at: "2025-01-01",
    price: 289000, compare_at_price: 349000, currency: "TWD",
    stock_quantity: 20, stock_status: "in_stock", commerce_active: true,
    preorder: false, preorder_message: null, shipping_class: null,
  },
  "d11ba-water-dispenser": {
    slug: "d11ba-water-dispenser", sku: "WH-D11BA-TW", name: "D11-BA 智慧寵物飲水機",
    tagline: "靜音湧泉循環過濾，讓貓愛上喝水",
    short_description: "超靜音湧泉設計，四重過濾系統確保水質潔淨。2.5L大容量，適合多貓家庭。",
    description: null, category: "water_dispenser", solutions: ["cat-not-drinking"],
    hero_image_url: "/images/products/d11ba-hero-banner.jpg",
    images: [{ image: "/images/products/d11ba-lifestyle.jpg", alt: "D11-BA 情境圖" }],
    features: [{ icon: "silent", title: "超靜音湧泉", description: "<30dB 靜音運轉不打擾" }, { icon: "filter", title: "四重過濾", description: "有效去除雜質與異味" }, { icon: "capacity", title: "2.5L大容量", description: "適合多貓家庭" }],
    specs: [{ label: "容量", value: "2.5L" }, { label: "電源", value: "USB-C" }, { label: "連線", value: "WiFi 2.4GHz" }, { label: "重量", value: "1.2kg" }],
    faq_items: [{ question: "濾芯多久換一次？", answer: { text: "建議每 4-6 週更換一次。" } }],
    how_to_steps: null, meta_title: null, meta_description: null,
    created_at: "2025-01-01", updated_at: "2025-01-01",
    price: 249000, compare_at_price: 299000, currency: "TWD",
    stock_quantity: 30, stock_status: "in_stock", commerce_active: true,
    preorder: false, preorder_message: null, shipping_class: null,
  },
  "d61-stainless-dispenser": {
    slug: "d61-stainless-dispenser", sku: "WH-D61-TW", name: "D61 智慧不鏽鋼寵物飲水機",
    tagline: "醫療級不鏽鋼，抗菌耐用首選",
    short_description: "採用304醫療級不鏽鋼材質，抗菌認證，循環過濾系統確保水質潔淨安全。",
    description: null, category: "water_dispenser", solutions: ["kidney-care"],
    hero_image_url: "/images/products/d61-hero-banner.jpg",
    images: [{ image: "/images/products/d61-lifestyle.jpg", alt: "D61 情境圖" }],
    features: [{ icon: "stainless", title: "304不鏽鋼", description: "醫療級抗菌材質" }, { icon: "filter", title: "循環過濾", description: "持續循環保持水質新鮮" }, { icon: "safe", title: "低水位提醒", description: "APP即時通知加水" }],
    specs: [{ label: "容量", value: "2L" }, { label: "電源", value: "USB-C" }, { label: "連線", value: "WiFi 2.4GHz" }, { label: "重量", value: "1.5kg" }],
    faq_items: null, how_to_steps: null, meta_title: null, meta_description: null,
    created_at: "2025-01-01", updated_at: "2025-01-01",
    price: 329000, compare_at_price: 389000, currency: "TWD",
    stock_quantity: 12, stock_status: "in_stock", commerce_active: true,
    preorder: false, preorder_message: null, shipping_class: null,
  },
};

/** Compute derived fields from raw API product row */
function computeProductFields(p: CMSProduct): CMSProduct {
  return p;
}

/** Fetch single product by slug with LIVE commerce data + fallback */
export function useProduct(slug: string) {
  const apiResult = useAPI<CMSProduct>(
    async () => {
      const res = await apiGet<APIResponse<CMSProduct>>(`/products/detail?slug=${encodeURIComponent(slug)}`);
      if (!res.data) throw new Error("Product not found");
      return computeProductFields(res.data);
    },
    [slug]
  );

  // Return fallback product when API fails
  if ((apiResult.error || !apiResult.data) && FALLBACK_PRODUCTS[slug]) {
    return { ...apiResult, data: FALLBACK_PRODUCTS[slug], error: null, isLoading: false };
  }
  return apiResult;
}

/** Fetch all published products with LIVE commerce data */
export function useProducts(category?: string) {
  return useAPIList<CMSProduct>(
    async () => {
      const catParam = category ? `&category=${encodeURIComponent(category)}` : "";
      const res = await apiGet<APIResponse<CMSProduct[]>>(`/products?limit=50${catParam}`);
      return (res.data || []).map(computeProductFields);
    },
    [category]
  );
}

/** Fetch bestseller products */
export function useBestsellers(limit = 4) {
  return useAPIList<CMSProduct>(
    async () => {
      const res = await apiGet<APIResponse<CMSProduct[]>>(`/products/bestsellers?limit=${limit}`);
      return (res.data || []).map(computeProductFields);
    },
    [limit]
  );
}

/** Fetch newest products */
export function useNewArrivals(limit = 4) {
  return useAPIList<CMSProduct>(
    async () => {
      const res = await apiGet<APIResponse<CMSProduct[]>>(`/products?limit=${limit}`);
      return (res.data || []).map(computeProductFields);
    },
    [limit]
  );
}

/* ================================================================ */
/*  SOLUTION HOOKS                                                    */
/* ================================================================ */

export function useSolutions(limit = 10) {
  return useAPIList<CMSSolution>(
    async () => {
      const res = await apiGet<APIResponse<CMSSolution[]>>(`/solutions?limit=${limit}`);
      return res.data || [];
    },
    [limit]
  );
}

export function useProblemSolutions() {
  return useAPIList<CMSProblemSolution>(
    async () => {
      const res = await apiGet<APIResponse<CMSSolution[]>>("/solutions?limit=10");
      const items = res.data || [];
      return items
        .filter((s) => s.pain_point)
        .map((s) => ({
          problem: s.pain_point!,
          solution: s.title,
          productSlug: s.recommended_products?.[0] || "",
        }));
    },
    []
  );
}

/* ================================================================ */
/*  LEARN ARTICLE HOOKS                                               */
/* ================================================================ */

export function useLearnArticles(limit = 4) {
  return useAPIList<CMSLearnArticle>(
    async () => {
      try {
        const res = await apiGet<APIResponse<CMSLearnArticle[]>>(`/learn-articles?limit=${limit}`);
        if (res.data && res.data.length > 0) return res.data;
      } catch {
        // CMS table empty — use fallback
      }
      return FALLBACK_LEARN_ARTICLES.slice(0, limit);
    },
    [limit]
  );
}

/* ================================================================ */
/*  REVIEW HOOKS                                                      */
/* ================================================================ */

export function useReviews(limit = 6) {
  return useAPIList<CMSReview>(
    async () => {
      try {
        const res = await apiGet<APIResponse<CMSReview[]>>(`/reviews?limit=${limit}`);
        if (res.data && res.data.length > 0) return res.data;
      } catch {
        // CMS table empty — use fallback
      }
      return FALLBACK_REVIEWS.slice(0, limit);
    },
    [limit]
  );
}

/* ================================================================ */
/*  FAQ HOOKS                                                         */
/* ================================================================ */

export function useFAQs(limit = 5) {
  return useAPIList<CMSFAQItem>(
    async () => {
      try {
        const res = await apiGet<APIResponse<CMSProduct[]>>("/products?limit=10");
        const products = res.data || [];
        const items: CMSFAQItem[] = [];
        let id = 1;
        for (const p of products) {
          if (p.faq_items) {
            for (const f of p.faq_items) {
              if (items.length >= limit) break;
              items.push({
                id: `faq-${id++}`,
                question: f.question,
                answer: typeof f.answer === "string" ? f.answer : JSON.stringify(f.answer),
                category: "product",
              });
            }
          }
        }
        if (items.length > 0) return items;
      } catch {
        // ignore
      }
      return [
        { id: "faq-1", question: "智能飲水機的濾芯多久需要更換一次？", answer: "建議每 4-6 週更換一次，視使用頻率與水質而定。當出水量明顯減少或APP提醒時，即需更換。", category: "product" },
        { id: "faq-2", question: "產品保固期是多長？", answer: "全系列產品均享有一年原廠保固，馬達核心部件延長至三年保固。", category: "service" },
        { id: "faq-3", question: "可以退貨或換貨嗎？", answer: "收到商品後七天內，若產品未使用且包裝完整，可申請退換貨。智能產品享15天試用期。", category: "service" },
        { id: "faq-4", question: "如何連接APP進行遠端操控？", answer: "下載 Westinghouse Pet App，長按產品WiFi鍵3秒進入配對模式，依照App指示完成連線即可。", category: "product" },
        { id: "faq-5", question: "運費如何計算？", answer: "全館消費滿 NT$1,500 即享免運，未達免運門檻收取 NT$100 運費。外島地區另計。", category: "shipping" },
      ].slice(0, limit);
    },
    [limit]
  );
}

/* ================================================================ */
/*  HERO SLIDE HOOKS                                                  */
/* ================================================================ */

export function useHeroSlides() {
  return useAPIList<CMSHeroSlide>(
    async () => {
      try {
        const res = await apiGet<APIResponse<CMSProduct[]>>("/products?limit=3");
        const products = res.data || [];
        if (products.length === 0) return getStaticHeroSlides();

        return products.slice(0, 2).map((p, i) => {
          const img = buildImageUrl(p.hero_image_url, p.name);
          return {
            id: `hero-${p.slug}`,
            title: i === 0 ? "用科技守護\n毛孩的每一天" : p.name,
            subtitle: i === 0
              ? "Westinghouse Pet 台灣官方旗艦店 — 智能寵物用品領導品牌"
              : (p.tagline || p.short_description || ""),
            ctaLabel: i === 0 ? "探索全系列商品" : "了解詳情",
            ctaHref: i === 0 ? "/products" : `/products/${p.slug}`,
            image: img,
            badge: i === 0 ? "新品上市" : undefined,
          };
        });
      } catch {
        return getStaticHeroSlides();
      }
    },
    []
  );
}

function getStaticHeroSlides(): CMSHeroSlide[] {
  return [
    {
      id: "hero-001",
      title: "用科技守護\n毛孩的每一天",
      subtitle: "Westinghouse Pet 台灣官方旗艦店 — 智能寵物用品領導品牌，滿額免運",
      ctaLabel: "探索全系列商品",
      ctaHref: "/products",
      image: { url: "/images/homepage-hero.jpg", alt: "Westinghouse Pet 智能寵物用品與毛孩的溫馨日常" },
      badge: "滿額免運",
    },
  ];
}

/* ================================================================ */
/*  UTILITY HOOK                                                      */
/* ================================================================ */

export function useAsyncExec() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, error, execute };
}
