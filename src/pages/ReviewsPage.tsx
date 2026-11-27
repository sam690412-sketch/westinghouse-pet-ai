import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useI18n } from '@/i18n';
import { REVIEWS, reviewLabels } from '@/data/reviews';
import { AuthenticReviewsSection } from '@/sections/AuthenticReviewsSection';

const RECOMMENDATIONS = [
  { slug: "m81-fresh-food-feeder", name: "M81 鮮濕糧智慧餵食器", image: "/images/products/card/m81-card.webp", tagline: "4°C鎖鮮+預熱出糧" },
  { slug: "m12-panoramic-feeder", name: "M12 智慧全景餵食器", image: "/images/products/card/m12-card.webp", tagline: "全景監控+大容量" },
  { slug: "m31-gashapon-feeder", name: "M31 智慧扭蛋餵食器", image: "/images/products/card/m31-card.webp", tagline: "扭蛋互動+防卡糧" },
  { slug: "d11ba-water-dispenser", name: "D11-BA 智慧寵物飲水機", image: "/images/products/card/d11-ba-card.webp", tagline: "雙無線+五重過濾" },
  { slug: "d61-stainless-dispenser", name: "D61 智慧不鏽鋼飲水機", image: "/images/products/card/d61-card.webp", tagline: "全不鏽鋼+47天續航" },
];

function RecommendationSection() {
  return (
    <section className="w-full border-t border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-xl font-bold">推薦商品</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {RECOMMENDATIONS.map((item) => (
            <a
              key={item.slug}
              href={`/#/products/${item.slug}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-3 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-white">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-semibold leading-tight">{item.name}</span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">{item.tagline}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ReviewsPage() {
  const {locale} = useI18n();
  const labels = reviewLabels[locale];
  return <main className="min-h-screen bg-neutral-50">
    <div className="container-section py-5"><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/>{labels.back}</Link></div>
    {REVIEWS.length ? <AuthenticReviewsSection showAllLink={false}/> : <p className="container-section py-12">{labels.empty}</p>}
    <RecommendationSection />
  </main>;
}
