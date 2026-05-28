import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useCMS";
import { useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { Heading } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/molecule/ProductCard";

interface RelatedProductsSectionProps {
  currentSlug: string;
  category: string;
}

export function RelatedProductsSection({ currentSlug, category }: RelatedProductsSectionProps) {
  const { data: allProducts, isLoading } = useProducts(category);
  const related = allProducts.filter((p) => p.slug !== currentSlug).slice(0, 4);
  const stagger = useStaggerAnimation(related.length, { threshold: 0.1 });

  if (!isLoading && related.length === 0) return null;

  return (
    <section className="px-6 py-16 sm:px-12 lg:px-20 lg:py-20" aria-label="相關商品">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Heading as="h2" variant="h3">
            相關商品
          </Heading>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="/products">
              查看全部
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div
            ref={stagger.ref}
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {related.map((product, i) => (
              <div key={product.slug} style={stagger.getDelayStyle(i)}>
                <ProductCard
                  slug={product.slug}
                  name={product.name}
                  tagline={product.tagline || product.short_description || undefined}
                  price={product.price}
                  originalPrice={product.compare_at_price ?? undefined}
                  imageUrl={product.hero_image_url || undefined}
                  stockStatus={product.stock_status}
                  onAddToCart={() => {}}
                  onWishlist={() => {}}
                  onQuickView={() => {}}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
