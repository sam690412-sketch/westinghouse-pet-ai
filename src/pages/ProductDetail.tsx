import { useParams } from "react-router";
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

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading: loading, error } = useProduct(slug || "");

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

  return (
    <>
      <UrgencyBanner stockStatus={product.stock_status} />

      <nav aria-label="麵包屑" className="mx-auto max-w-7xl px-6 py-3 text-sm text-muted-foreground sm:px-12 lg:px-20">
        <ol className="flex items-center gap-2">
          <li><a href="/" className="hover:text-foreground">首頁</a></li>
          <li>/</li>
          <li><a href="/products" className="hover:text-foreground">全部商品</a></li>
          <li>/</li>
          <li className="text-foreground" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <ProductHeroSection product={product} />

      {product.features && product.features.length > 0 && (
        <ProductFeaturesSection features={product.features} />
      )}

      {product.specs && product.specs.length > 0 && (
        <ProductSpecsSection specs={product.specs} />
      )}

      {product.faq_items && product.faq_items.length > 0 && (
        <ProductFAQSection faqItems={product.faq_items} />
      )}

      <BundleRecommendationSection currentSlug={product.slug} />
      <WhyChooseUsSection />
    </>
  );
}
