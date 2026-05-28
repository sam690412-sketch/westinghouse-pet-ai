import { Briefcase, Home, Building2, Cat, Plane, HeartPulse, Camera, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { Heading, Text } from "@/components/atomic/Typography";

/* ------------------------------------------------------------------ */
/*  DATA — 7 Taiwan user scenarios                                     */
/* ------------------------------------------------------------------ */

const scenarios = [
  {
    icon: Briefcase,
    title: "上班族",
    subtitle: "早出晚歸的安心",
    description: "每天加班到八九點，不用再擔心毛孩餓肚子。APP 設定好餵食時間，回家看到食盆乾乾淨淨，貓咪開心迎接。",
    product: "M12 智慧全景餵食器",
    testimonial: "「以前每天下班衝回家餵貓，現在終於可以從容吃個晚餐再回去。」— 陳小姐，台北",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Home,
    title: "多貓家庭",
    subtitle: "每隻貓都顧到",
    description: "三隻貓搶一個水碗的日子結束了。4L 大容量讓每隻貓隨時有新鮮活水，飲水量 APP 一目了然，健康不再被忽略。",
    product: "D61 智慧不鏽鋼飲水機",
    testimonial: "「三隻貓同時喝水的畫面太療癒了，而且再也不用每天洗好幾個水碗。」— 林先生，台中",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Building2,
    title: "小宅租屋族",
    subtitle: "空間不夠也能養好貓",
    description: "租屋空間有限，一台餵食器 + 飲水機二合一最省空間。靜音設計不怕吵到鄰居，外型簡約融入任何裝潢。",
    product: "M81 鮮濕糧智慧餵食器",
    testimonial: "「我的小套房放這台剛剛好，室友說根本沒聽到聲音，還以為是假的。」— 王同學，新竹",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Plane,
    title: "經常外出",
    subtitle: "出差旅遊不擔心",
    description: "餵食器續航 15 天、飲水機續航 47 天。出國一週也不用找寵物保姆，APP 隨時確認毛孩狀況，安心享受假期。",
    product: "M81 + D61 組合",
    testimonial: "「去日本玩了五天，每天打開 APP 看貓咪吃飽飽，比請人來還放心。」— 張小姐，高雄",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: Camera,
    title: "遠端監控需求",
    subtitle: "隨時看見毛孩",
    description: "M31 扭蛋餵食器內建 1080P 攝影機，上班也能看貓咪吃飯。雙向語音互動，午休時間隔空呼喚毛孩，超療癒。",
    product: "M31 智慧扭蛋餵食器",
    testimonial: "「上班偷看貓咪吃飯變成我的每日療癒儀式，同事都問我在笑什麼。」— 黃小姐，桃園",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-100",
  },
  {
    icon: HeartPulse,
    title: "毛孩健康管理",
    subtitle: "預防勝於治療",
    description: "飲水機監控每日飲水量，異常即時通知。流動水吸引貓咪多喝水，預防腎臟疾病和泌尿問題，讓獸醫檢查報告更漂亮。",
    product: "D11-BA 智慧寵物飲水機",
    testimonial: "「獸醫說貓咪喝水量變多了，上次檢查腎指數有進步，這筆錢花得太值得。」— 李太太，台南",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    icon: Cat,
    title: "新手飼主",
    subtitle: "第一次養貓也不怕",
    description: "第一次養貓手忙腳亂？自動餵食器幫你定時定量，飲水機讓貓咪愛上喝水。15 天試用期不滿意全額退，零風險嘗試。",
    product: "新手入門組合",
    testimonial: "「第一次養貓什麼都不懂，客服 LINE 一步步教我設定，貓咪現在每天都乖乖吃飯。」— 許小姐，台北",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function UserScenarioSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const stagger = useStaggerAnimation(scenarios.length, { threshold: 0.05, staggerDelay: 80 });

  return (
    <section
      className="px-6 py-16 sm:px-12 lg:px-20 lg:py-20"
      aria-label="台灣飼主真實情境"
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
            FOR EVERY PET PARENT
          </Text>
          <Heading as="h2" variant="h2" className="mt-2">
            哪種飼主說中了你？
          </Heading>
          <Text variant="body" color="muted" className="mx-auto mt-3 max-w-2xl">
            超過 10,000 位台灣飼主已經找到最適合自己的智能寵物用品
          </Text>
        </div>

        {/* Scenarios Grid */}
        <div
          ref={stagger.ref}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {scenarios.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={cn(
                  "group relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                  "transition-all duration-300 hover:shadow-card-hover",
                  item.border
                )}
                style={stagger.getDelayStyle(i)}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                    item.bg
                  )}
                >
                  <Icon className={cn("h-6 w-6", item.color)} />
                </div>

                {/* Title */}
                <div className="mt-4">
                  <Heading as="h3" variant="h5">
                    {item.title}
                  </Heading>
                  <Text variant="caption" className={cn("font-medium", item.color)}>
                    {item.subtitle}
                  </Text>
                </div>

                {/* Description */}
                <Text variant="bodySmall" color="muted" className="mt-2 leading-relaxed">
                  {item.description}
                </Text>

                {/* Product Tag */}
                <div className="mt-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                      item.bg,
                      item.color
                    )}
                  >
                    推薦：{item.product}
                  </span>
                </div>

                {/* Testimonial */}
                <div className="mt-4 rounded-xl bg-neutral-50 p-3">
                  <Text variant="caption" color="muted" className="italic leading-relaxed">
                    {item.testimonial}
                  </Text>
                </div>

                {/* CTA */}
                <a
                  href="/products"
                  className={cn(
                    "mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors",
                    item.color,
                    "hover:underline"
                  )}
                >
                  查看推薦產品
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
