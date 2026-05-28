import { ShieldCheck, Truck, RotateCcw, Headphones, Award, Leaf, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { Heading, Text } from "@/components/atomic/Typography";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const reasons = [
  {
    icon: ShieldCheck,
    title: "一年原廠保固",
    description: "核心馬達延長至三年保固，台灣本地維修服務",
    highlight: "3年馬達保固",
  },
  {
    icon: Truck,
    title: "滿額免運到家",
    description: "全館滿 NT$1,500 即享免運，1-3 天快速到貨",
    highlight: "滿$1500免運",
  },
  {
    icon: RotateCcw,
    title: "15 天試用保障",
    description: "智能產品享 15 天試用期，不滿意全額退",
    highlight: "15天試用",
  },
  {
    icon: Headphones,
    title: "台灣專屬客服",
    description: "在地客服團隊，LINE/電話即時諮詢",
    highlight: "LINE即時回覆",
  },
  {
    icon: Award,
    title: "國際安全認證",
    description: "CE / FCC / BSMI 認證，食品級材質",
    highlight: "BSMI認證",
  },
  {
    icon: Leaf,
    title: "節能環保設計",
    description: "低功耗運轉，耗材可循環使用",
    highlight: "節能省電",
  },
];

const stats = [
  { value: "10,000+", label: "滿意飼主" },
  { value: "4.8/5", label: "平均評分" },
  { value: "99.2%", label: "好評率" },
  { value: "24hr", label: "客服回覆" },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function WhyChooseUsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const stagger = useStaggerAnimation(reasons.length, { threshold: 0.1, staggerDelay: 80 });

  return (
    <section
      className="section-px section-py"
      aria-label="為什麼選擇我們"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "mb-12 text-center transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Text variant="overline" className="text-primary">
            WHY CHOOSE US
          </Text>
          <Heading as="h2" variant="h2" className="mt-2">
            萬位飼主信賴的選擇
          </Heading>
          <Text variant="body" color="muted" className="mx-auto mt-3 max-w-2xl">
            從產品品質到售後服務，每一個環節我們都為毛孩與飼主精心把關
          </Text>
        </div>

        {/* Stats Bar */}
        <div
          className={cn(
            "mb-12 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:grid-cols-4 lg:gap-8 lg:p-8",
            "transition-all duration-700 delay-100",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
              <Text variant="caption" color="muted" className="mt-1">
                {stat.label}
              </Text>
            </div>
          ))}
        </div>

        {/* Reasons Grid */}
        <div
          ref={stagger.ref}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {reasons.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={cn(
                  "group relative rounded-2xl border border-border bg-card p-6 shadow-card",
                  "transition-all duration-300 hover:shadow-card-hover hover:border-primary/20"
                )}
                style={stagger.getDelayStyle(i)}
              >
                {/* Highlight Badge */}
                <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  {item.highlight}
                </span>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <Heading as="h3" variant="h5" className="mt-4">
                  {item.title}
                </Heading>

                <Text variant="bodySmall" color="muted" className="mt-1.5">
                  {item.description}
                </Text>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Line */}
        <div
          className={cn(
            "mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground",
            "transition-all duration-700 delay-500",
            headerVisible ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            1-3 天到貨
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            台灣本島配送
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span>7-ELEVEN / 全家取貨</span>
          <span className="hidden sm:inline text-border">|</span>
          <span>貨到付款</span>
        </div>
      </div>
    </section>
  );
}
