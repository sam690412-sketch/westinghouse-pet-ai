import { cn } from "@/lib/utils";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { SectionTitle } from "@/components/atomic/SectionTitle";
import { Text } from "@/components/atomic/Typography";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const categories = [
  {
    slug: "smart_water_fountain",
    label: "智能飲水機",
    description: "UV殺菌自動循環",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden="true">
        <path d="M24 8C24 8 14 18 14 26a10 10 0 0020 0c0-8-10-18-10-18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 20v12M20 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    href: "/products?category=smart_water_fountain",
  },
  {
    slug: "smart_feeder",
    label: "自動餵食器",
    description: "遠端定時定量",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden="true">
        <rect x="12" y="18" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M18 18v-4a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 28h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    href: "/products?category=smart_feeder",
  },
  {
    slug: "pet_dryer_box",
    label: "寵物烘乾箱",
    description: "低溫靜音烘乾",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden="true">
        <rect x="10" y="12" width="28" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 20h28M18 28h4M26 28h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 8v4M16 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: "bg-green-50 text-green-600 hover:bg-green-100",
    href: "/products?category=pet_dryer_box",
  },
  {
    slug: "smart_pet_house",
    label: "智能寵物窩",
    description: "四季恆溫舒適",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden="true">
        <path d="M24 8L8 22h4v18h10V30h4v10h10V22h4L24 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    href: "/products?category=smart_pet_house",
  },
  {
    slug: "litter_box",
    label: "貓砂盆",
    description: "自動清理除臭",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden="true">
        <rect x="8" y="16" width="32" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 16V12a8 8 0 0116 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="26" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    href: "/products?category=litter_box",
  },
  {
    slug: "grooming_kit",
    label: "美容工具",
    description: "居家專業護理",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden="true">
        <path d="M16 36l16-24M20 14l-4 4M28 14l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="34" cy="14" r="3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="14" cy="34" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    color: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    href: "/products?category=grooming_kit",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function ProductCategorySection() {
  const { ref } = useScrollAnimation({ threshold: 0.1 });
  const stagger = useStaggerAnimation(categories.length, { threshold: 0.1, staggerDelay: 60 });

  return (
    <section
      ref={ref}
      id="product-categories"
      className="section-px section-py"
      aria-label="商品分類"
    >
      <SectionTitle
        title="探索商品分類"
        subtitle="為毛孩打造智能舒適的生活體驗"
        align="center"
      />

      <div
        ref={stagger.ref}
        className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5"
      >
        {categories.map((cat, i) => (
          <a
            key={cat.slug}
            href={cat.href}
            className={cn(
              "group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            style={stagger.getDelayStyle(i)}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-200",
                cat.color
              )}
            >
              {cat.icon}
            </div>
            <div className="text-center">
              <Text variant="label" weight="semibold" className="block">
                {cat.label}
              </Text>
              <Text variant="caption" color="muted" className="mt-0.5 hidden sm:block">
                {cat.description}
              </Text>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
