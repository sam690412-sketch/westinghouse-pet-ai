import { useState } from "react";
import { HelpCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Heading, Text } from "@/components/atomic/Typography";
// FAQAccordion uses shadcn/ui Accordion directly, not FAQItem molecule

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface FAQCategory {
  id: string;
  label: string;
  icon?: React.ElementType;
}

export interface FAQAccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** FAQ items */
  items: FAQItem[];
  /** Category filter tabs */
  categories?: FAQCategory[];
  /** Active category */
  activeCategory?: string;
  /** Callback when category changes */
  onCategoryChange?: (category: string) => void;
  /** Allow multiple items open */
  allowMultiple?: boolean;
  /** Callback when item toggled */
  onItemToggle?: (itemId: string, open: boolean) => void;
  /** CTA at bottom */
  ctaText?: string;
  ctaHref?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

/* ------------------------------------------------------------------ */
/*  DEFAULT DATA                                                       */
/* ------------------------------------------------------------------ */

const defaultCategories: FAQCategory[] = [
  { id: "all", label: "全部" },
  { id: "product", label: "產品相關" },
  { id: "shipping", label: "配送與退換" },
  { id: "warranty", label: "保固與維修" },
  { id: "account", label: "帳號與付款" },
];

const defaultItems: FAQItem[] = [
  {
    id: "faq-001",
    category: "product",
    question: "智能飲水機的濾芯多久需要更換一次？",
    answer:
      "建議每 30 天更換一次濾芯，以確保水質潔淨。若家中有多隻寵物或使用頻率較高，建議縮短至 20 天更換。當APP顯示「濾芯壽命不足」或出水量明顯減少時，也應立即更換。",
  },
  {
    id: "faq-002",
    category: "product",
    question: "自動餵食器可以投放凍乾飼料嗎？",
    answer:
      "可以。Westinghouse 自動餵食器採用彈性葉片設計，適用於直徑 2-15mm 的乾糧、凍乾與混合飼料。不建議投放濕食或半濕食，以免造成機器內部潮濕與細菌滋生。",
  },
  {
    id: "faq-003",
    category: "product",
    question: "烘乾箱的溫度範圍是多少？安全嗎？",
    answer:
      "烘乾箱溫度範圍為 30°C-45°C，採用 PTC 陶瓷加熱技術與雙重溫度感應器。當溫度超過 50°C 會自動斷電，並透過APP推播警報。機身採用防燙設計，寵物可直接碰觸外殼。",
  },
  {
    id: "faq-004",
    category: "shipping",
    question: "訂單成立後多久會出貨？",
    answer:
      "一般訂單於工作日 14:00 前完成付款，當日出貨；14:00 後則順延至下一工作日。預購商品依商品頁面標示的預計出貨時間為準。週末與國定假日不出貨。",
  },
  {
    id: "faq-005",
    category: "shipping",
    question: "可以超商取貨嗎？",
    answer:
      "可以。我們提供 7-ELEVEN 與全家便利商店取貨服務，訂單金額上限為 NT$20,000。商品送達指定門市後，您將收到簡訊與 Email 通知，請於 7 日內取件。",
  },
  {
    id: "faq-006",
    category: "shipping",
    question: "退換貨政策是什麼？",
    answer:
      "收到商品後 7 日內可申請退貨，商品需保持全新未使用狀態且包裝完整。若商品有瑕疵或故障，15 日內可申請換貨。智能電子產品拆封後，若非商品瑕疵恕不接受退貨。",
  },
  {
    id: "faq-007",
    category: "warranty",
    question: "保固期限是多久？",
    answer:
      "全系列主機享有一年原廠保固，馬達與電子控制板保固三年，濾芯、水管等耗材不在保固範圍內。保固期內非人為損壞可免費維修或更換新品。",
  },
  {
    id: "faq-008",
    category: "warranty",
    question: "如何申請維修服務？",
    answer:
      "請至「會員中心 > 維修申請」填寫表單，或撥打客服專線 0800-000-000。維修中心收到申請後 1-2 工作日會與您聯繫，確認後提供到府收件或寄送服務。",
  },
  {
    id: "faq-009",
    category: "account",
    question: "支援哪些付款方式？",
    answer:
      "我們支援信用卡（Visa / Master / JCB）、LINE Pay、超商取貨付款、以及銀行轉帳。分期付款提供 3、6、12 期零利率（限指定銀行信用卡）。",
  },
  {
    id: "faq-010",
    category: "account",
    question: "忘記密碼怎麼辦？",
    answer:
      "請點擊登入頁面的「忘記密碼」，輸入註冊時使用的電子信箱，系統將發送密碼重設連結。連結有效期為 24 小時，若未收到請檢查垃圾郵件資料夾。",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function FAQAccordion({
  title = "常見問題",
  subtitle = "快速找到您需要的答案",
  items = defaultItems,
  categories = defaultCategories,
  activeCategory = "all",
  onCategoryChange,
  allowMultiple = false,
  onItemToggle,
  ctaText = "還有其他問題？聯絡我們",
  ctaHref = "/contact",
  className,
  ...props
}: FAQAccordionProps) {
  const [internalCategory, setInternalCategory] = useState(activeCategory);
  const effectiveCategory = onCategoryChange ? activeCategory : internalCategory;

  const filtered =
    effectiveCategory === "all"
      ? items
      : items.filter((i) => i.category === effectiveCategory);

  return (
    <section className={cn("px-4 py-10 lg:px-8", className)} {...props}>
      {/* Section Header */}
      <div className="mb-6 text-center md:mb-8">
        {title && (
          <div className="mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <Heading as="h2" variant="h2">
              {title}
            </Heading>
          </div>
        )}
        {subtitle && (
          <Text variant="body" color="muted">
            {subtitle}
          </Text>
        )}
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const isActive = effectiveCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setInternalCategory(cat.id);
                  onCategoryChange?.(cat.id);
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-neutral-100 text-muted-foreground hover:bg-neutral-200"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Accordion */}
      <div className="mx-auto max-w-3xl">
        <Accordion
          type={allowMultiple ? "multiple" : "single"}
          collapsible
          className="space-y-3"
          onValueChange={(value: string | string[]) => {
            if (onItemToggle && typeof value === "string") {
              onItemToggle(value, true);
            }
          }}
        >
          {filtered.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="rounded-xl border border-border bg-card px-5 py-1 shadow-sm transition-colors data-[state=open]:border-primary/20"
            >
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline md:text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <Text variant="body" color="muted" className="pt-1 pb-3">
                  {item.answer}
                </Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <HelpCircle className="mx-auto mb-2 h-10 w-10 opacity-40" />
            <p>此分類暫無問題</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <a
          href={ctaHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
        >
          {ctaText}
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

FAQAccordion.displayName = "FAQAccordion";
