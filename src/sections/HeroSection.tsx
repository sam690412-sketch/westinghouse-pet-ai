import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHeroSlides } from "@/hooks/useCMS";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function HeroSection() {
  const { data: slides = [], isLoading } = useHeroSlides();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide, slides.length]);

  if (isLoading) {
    return (
      <section className="relative aspect-hero w-full overflow-hidden bg-neutral-200 animate-pulse" aria-label="載入中">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 to-neutral-100" />
      </section>
    );
  }

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section
      className="relative aspect-[3/4] sm:aspect-[16/10] lg:aspect-[21/9] w-full overflow-hidden bg-neutral-900 max-h-[85vh]"
      aria-label="首頁橫幅"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform ease-linear"
            style={{
              transitionDuration: "8000ms",
              backgroundImage: `url(${s.image.url})`,
              transform: i === current ? "scale(1.05)" : "scale(1)",
            }}
            role="img"
            aria-label={s.image.alt}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-xl">
          {/* Badge */}
          {slide.badge && (
            <Badge className="mb-4 bg-pet-paw text-white border-0 animate-fade-in">
              {slide.badge}
            </Badge>
          )}

          {/* Title */}
          <Heading
            as="h1"
            variant="h1"
            className="mb-4 text-white whitespace-pre-line"
          >
            {slide.title}
          </Heading>

          {/* Subtitle */}
          <Text
            variant="bodyLarge"
            className="mb-8 text-white/80"
          >
            {slide.subtitle}
          </Text>

          {/* CTA */}
          <Button
            size="lg"
            className="gap-2 bg-white text-foreground hover:bg-white/90 shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
            asChild
          >
            <a href={slide.ctaHref}>
              {slide.ctaLabel}
              <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="上一張"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="下一張"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === current
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/70"
                )}
                aria-label={`前往第 ${i + 1} 張`}
                aria-current={i === current ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
