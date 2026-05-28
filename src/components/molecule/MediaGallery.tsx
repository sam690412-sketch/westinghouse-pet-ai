import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface MediaGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  images: GalleryImage[];
  heroImage?: string;
  heroAlt?: string;
}

export const MediaGallery = forwardRef<HTMLDivElement, MediaGalleryProps>(
  ({ images, heroImage, heroAlt, className, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const allImages: GalleryImage[] = heroImage
      ? [{ url: heroImage, alt: heroAlt || "Hero" }, ...images]
      : images;

    const goNext = useCallback(() => {
      setActiveIndex((prev) => (prev + 1) % allImages.length);
    }, [allImages.length]);

    const goPrev = useCallback(() => {
      setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }, [allImages.length]);

    if (allImages.length === 0) return null;

    return (
      <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
        {/* Main Image */}
        <div
          className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 md:aspect-[4/3]"
          onClick={() => setIsZoomed(!isZoomed)}
          role="button"
          tabIndex={0}
          aria-label="Toggle zoom"
          onKeyDown={(e) => e.key === "Enter" && setIsZoomed(!isZoomed)}
        >
          <img
            src={allImages[activeIndex].url}
            alt={allImages[activeIndex].alt}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500",
              isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
            )}
          />
          <div className="absolute right-3 top-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm">
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                aria-label="上一張"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                aria-label="下一張"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {allImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  i === activeIndex
                    ? "border-primary shadow-sm"
                    : "border-transparent hover:border-neutral-300"
                )}
                aria-label={`查看 ${img.alt}`}
                aria-current={i === activeIndex ? "true" : undefined}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
MediaGallery.displayName = "MediaGallery";
