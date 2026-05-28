import { useEffect, useRef, useState, useCallback } from "react";

/* ================================================================
   SCROLL-BASED ANIMATION HOOK
   Uses IntersectionObserver for performant scroll-triggered animations
   ================================================================ */

interface ScrollAnimationOptions {
  /** Threshold at which the animation triggers (0-1) */
  threshold?: number;
  /** Root margin for early/late triggering */
  rootMargin?: string;
  /** Trigger only once (vs every time element enters view) */
  once?: boolean;
}

/**
 * Hook that returns a ref and a boolean indicating if the element
 * has intersected the viewport. Use for fade-in/slide-in animations.
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.15, rootMargin = "0px", once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

/**
 * Hook that returns a ref and a boolean for a "staggered" children animation.
 * Parent element gets the ref; children get delay-based animation classes.
 */
export function useStaggerAnimation(
  _itemCount: number,
  options: ScrollAnimationOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 75, threshold = 0.1, once = true } = options;
  const { ref, isVisible } = useScrollAnimation({ threshold, once });

  const getDelayClass = useCallback(
    (_index: number) => {
      if (!isVisible) return "opacity-0 translate-y-4";
      return `opacity-100 translate-y-0 transition-all duration-500 ease-out-expo`;
    },
    [isVisible]
  );

  const getDelayStyle = useCallback(
    (index: number): React.CSSProperties => {
      const delay = index * staggerDelay;
      if (!isVisible) return { opacity: 0, transform: "translateY(16px)" };
      return {
        opacity: 1,
        transform: "translateY(0)",
        transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      };
    },
    [isVisible, staggerDelay]
  );

  return { ref, isVisible, getDelayClass, getDelayStyle };
}

/**
 * Hook for scroll-to-section functionality
 */
export function useScrollTo() {
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  return scrollTo;
}

/**
 * Hook that tracks if user has scrolled past a threshold
 * Useful for sticky nav/back-to-top/CTA visibility
 */
export function useScrollThreshold(threshold: number = 200) {
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsPast(window.scrollY > threshold);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return isPast;
}
