import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heading, Text } from "@/components/atomic/Typography";
import { Badge } from "@/components/ui/badge";

const lifestyleItems = [
  {
    title: "清晨的寵愛時光",
    description: "晨光中，毛孩在自動餵食器旁享受新鮮早餐，飲水機靜靜流淌著過濾後的純淨活水。",
    image: "/images/lifestyle/morning.jpg",
    alt: "貓咪在自動餵食器旁吃早餐",
    badge: "晨間日常",
    large: true,
  },
  {
    title: "智能守護無時差",
    description: "無論身在何處，透過手機 App 隨時掌握毛孩動態。",
    image: "/images/lifestyle/app-control.jpg",
    alt: "飼主使用手機 App 操控寵物用品",
    badge: "遠端操控",
    large: false,
  },
  {
    title: "美容護理更輕鬆",
    description: "低溫靜音烘乾，20 分鐘完成吹毛，不再人貓大戰。",
    image: "/images/lifestyle/grooming.jpg",
    alt: "貓咪安靜地在烘乾箱中",
    badge: "居家美容",
    large: false,
  },
  {
    title: "四季皆宜的舒適窩",
    description: "冬天暖呼呼、夏天涼爽爽，給毛孩一整年的好眠。",
    image: "/images/lifestyle/pet-house.jpg",
    alt: "貓咪在智能寵物窩中安睡",
    badge: "四季恆溫",
    large: true,
  },
];

export function LifestyleSection({ compact }: { compact?: boolean }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const displayItems = compact ? lifestyleItems.slice(0, 1) : lifestyleItems;

  if (compact) {
    const item = lifestyleItems[0];
    return (
      <section
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-neutral-950",
          "transition-opacity duration-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        aria-label="生活方式"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.image})` }}
          role="img"
          aria-label={item.alt}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-7xl section-px section-py-sm text-center">
          <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0 backdrop-blur-sm">
            {item.badge}
          </Badge>
          <Heading as="h2" variant="h2" className="text-white">
            {item.title}
          </Heading>
          <Text variant="body" className="mt-2 text-white/70 max-w-xl mx-auto">
            {item.description}
          </Text>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={cn(
        "bg-neutral-950 px-6 py-16 sm:px-12 lg:px-20 lg:py-20",
        "transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      aria-label="生活方式"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Text variant="overline" className="text-pet-paw">
            LIFESTYLE
          </Text>
          <Heading as="h2" variant="h2" className="mt-2 text-white">
            與毛孩的美好日常
          </Heading>
          <Text variant="body" className="mt-2 text-neutral-400">
            讓科技融入每一個陪伴的瞬間
          </Text>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item, i) => (
            <div
              key={i}
              className={cn(
                "group relative overflow-hidden rounded-2xl",
                item.large ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : "aspect-[4/3]"
              )}
              style={{
                transitionDelay: `${i * 100}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`,
              }}
            >
              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.image})` }}
                role="img"
                aria-label={item.alt}
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0 backdrop-blur-sm">
                  {item.badge}
                </Badge>
                <Heading as="h3" variant="h5" className="text-white">
                  {item.title}
                </Heading>
                <Text variant="bodySmall" className="mt-1 text-white/70 line-clamp-2">
                  {item.description}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
