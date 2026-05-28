/* ================================================================
   CMS DATA TYPES — Westinghouse Pet Taiwan
   Mapped from Supabase public schema (LIVE data)
   ================================================================ */

/** Feature item from product_contents.features JSONB */
export interface CMSFeature {
  icon: string;
  title: string;
  description: string;
}

/** Spec item from product_contents.specs JSONB */
export interface CMSSpec {
  label: string;
  value: string;
}

/** FAQ item from product_contents.faq_items JSONB */
export interface CMSProductFAQ {
  question: string;
  answer: Record<string, unknown>;
}

/** How-to step from product_contents.how_to_steps JSONB */
export interface CMSHowToStep {
  step: number;
  title: string;
  description?: string;
  image?: string;
}

/** Unified product row from JOIN product_contents + commerce_products */
export interface CMSProduct {
  slug: string;
  sku: string;
  name: string;
  tagline: string | null;
  short_description: string | null;
  description: Record<string, unknown> | null;
  category: "feeder" | "water_dispenser" | "accessory";
  solutions: string[] | null;
  hero_image_url: string | null;
  images: Array<{ image?: string; alt?: string }> | null;
  features: CMSFeature[] | null;
  specs: CMSSpec[] | null;
  faq_items: CMSProductFAQ[] | null;
  how_to_steps: CMSHowToStep[] | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  // ---- commerce_products fields (LIVE) ----
  /** Price in cents (TWD) — integer, divide by 100 for display */
  price: number;
  /** Original price for comparison */
  compare_at_price: number | null;
  /** Currency code */
  currency: string;
  /** Physical stock quantity */
  stock_quantity: number;
  /** Stock status: in_stock | low_stock | out_of_stock | pre_order */
  stock_status: "in_stock" | "low_stock" | "out_of_stock" | "pre_order";
  /** Whether commerce record is active */
  commerce_active: boolean;
  /** Whether this is a preorder item */
  preorder: boolean;
  /** Preorder message to display */
  preorder_message: string | null;
  /** Shipping classification */
  shipping_class: string | null;
}

/** Solution article from public.solutions */
export interface CMSSolution {
  id: string;
  slug: string;
  title: string;
  pain_point: string | null;
  audience: string | null;
  content: { sections: Array<Record<string, unknown>> } | null;
  recommended_products: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** Learn article from public.learn_articles */
export interface CMSLearnArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: Record<string, unknown> | null;
  category: string | null;
  cover_image_url: string | null;
  author: string | null;
  read_time: number | null;
  published_at: string | null;
  updated_at: string | null;
}

/** Review from public.reviews */
export interface CMSReview {
  id: string;
  author_name: string;
  avatar_url: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  product_sku: string | null;
  product_slug: string | null;
  verified: boolean;
  helpful_count: number;
  created_at: string;
}

/** FAQ item */
export interface CMSFAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/** Problem-solution pair derived from solutions table */
export interface CMSProblemSolution {
  problem: string;
  solution: string;
  productSlug: string;
}

/** Hero slide */
export interface CMSHeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: { url: string; alt: string };
  badge?: string;
}

/** API response wrapper */
export interface APIResponse<T> {
  data: T;
  count?: number;
  error?: string;
}
