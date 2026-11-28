import { lazy, Suspense } from "react";
import { ProductComparison } from "@/components/organism/ProductComparison";

/* ================================================================ */
/*  ABOVE-THE-FOLD: Eager loaded (LCP critical)                     */
/* ================================================================ */
import { HeroSection } from "@/sections/HeroSection";
import { TrustIndicatorsSection } from "@/sections/TrustIndicatorsSection";
import { BestsellerSection } from "@/sections/BestsellerSection";
import { AuthenticReviewsSection } from "@/sections/AuthenticReviewsSection";

/* ================================================================ */
/*  BELOW-THE-FOLD: Lazy loaded (code-split)                        */
/* ================================================================ */
const ProblemSolutionSection = lazy(() =>
  import("@/sections/ProblemSolutionSection").then((m) => ({ default: m.ProblemSolutionSection }))
);
const FAQPreviewSection = lazy(() =>
  import("@/sections/FAQPreviewSection").then((m) => ({ default: m.FAQPreviewSection }))
);
const LifestyleSection = lazy(() =>
  import("@/sections/LifestyleSection").then((m) => ({ default: m.LifestyleSection }))
);
const CTASection = lazy(() =>
  import("@/sections/CTASection").then((m) => ({ default: m.CTASection }))
);

/** Minimal skeleton for lazy sections */
function SectionSkeleton() {
  return (
    <div className="section-py">
      <div className="container-section">
        <div className="mx-auto max-w-2xl">
          <div className="skeleton h-8 w-48 mx-auto rounded-lg" />
          <div className="skeleton mt-3 h-4 w-64 mx-auto rounded" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * CONVERSION-FOCUSED SHORT HOMEPAGE
 * Phase 4.9 — Optimized: code-split, consistent spacing, mobile-first
 */
export default function Home() {
  return (
    <main>
      {/* 1. Hero — LCP critical, eager loaded */}
      <HeroSection />

      {/* 2. Trust — immediate credibility */}
      <TrustIndicatorsSection />

      {/* 3. Bestsellers — social proof + products */}
      <BestsellerSection />

      {/* Below the fold — lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        {/* 4. Why Choose Us */}
        <ProductComparison />

        {/* 5. Problem → Solution */}
        <ProblemSolutionSection />

        {/* 6. Reviews — all preview stories */}
        <AuthenticReviewsSection />


        {/* 8. FAQ */}
        <FAQPreviewSection />

        {/* 9. Lifestyle banner */}
        <LifestyleSection compact />

        {/* 10. CTA */}
        <CTASection />
      </Suspense>
    </main>
  );
}
