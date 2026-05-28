import { ArrowRight } from "lucide-react";
import { useBestsellers } from "@/hooks/useCMS";
import { useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { SectionTitle } from "@/components/atomic/SectionTitle";
import { ProductCard } from "@/components/molecule/ProductCard";
import { Button } from "@/components/ui/button";

export function BestsellerSection() {
  const { data: products, isLoading } = useBestsellers(4);
  const stagger = useStaggerAnimation(products.length, { threshold: 0.1 });

  return (
    <section className="bg-neutral-50 section-px section-py" aria-label="熱銷商品">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          title="熱銷精選"
          subtitle="萬位飼主一致推薦，口碑保證"
          align="center"
        />

        {isLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div
              ref={stagger.ref}
              className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
            >
              {products.map((product, i) => (
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

            <div className="mt-10 text-center">
              <Button variant="outline" className="gap-2" asChild>
                <a href="/products">
                  查看全部商品
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
