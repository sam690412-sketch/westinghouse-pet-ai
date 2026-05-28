import { ShieldCheck, Truck, RotateCcw, Headphones, Award, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { Text } from "@/components/atomic/Typography";

const indicators = [
  {
    icon: ShieldCheck,
    title: "一年原廠保固",
    description: "核心馬達延長至三年保固",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Truck,
    title: "滿額免運",
    description: "全館滿 NT$1,500 享免運，1-3天到貨",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: RotateCcw,
    title: "15 天試用",
    description: "智能產品享15天試用保障",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Headphones,
    title: "台灣專屬客服",
    description: "LINE/電話即時諮詢",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Award,
    title: "BSMI 安全認證",
    description: "CE/FCC/BSMI 認證通過",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Leaf,
    title: "環保節能",
    description: "低功耗運轉，耗材可循環",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

export function TrustIndicatorsSection() {
  const stagger = useStaggerAnimation(indicators.length, { threshold: 0.1, staggerDelay: 50 });

  return (
    <section
      ref={stagger.ref}
      className="border-y border-border bg-neutral-50 section-px section-py-sm"
      aria-label="信任指標"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {indicators.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={cn(
                  "group flex flex-col items-center rounded-xl p-3 text-center",
                  "transition-all duration-300 hover:bg-white hover:shadow-md"
                )}
                style={stagger.getDelayStyle(i)}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                  item.bg
                )}>
                  <Icon className={cn("h-6 w-6", item.color)} aria-hidden="true" />
                </div>
                <Text variant="label" weight="semibold" className="mt-2.5">
                  {item.title}
                </Text>
                <Text variant="caption" color="muted" className="mt-0.5 line-clamp-2">
                  {item.description}
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
