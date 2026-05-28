import { HelpCircle } from "lucide-react";
import type { CMSProductFAQ } from "@/types/cms";
import { Heading } from "@/components/atomic/Typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ProductFAQSectionProps {
  faqItems: CMSProductFAQ[];
}

export function ProductFAQSection({ faqItems }: ProductFAQSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const answerText = (answer: Record<string, unknown>): string => {
    if (typeof answer === "string") return answer;
    // Try to extract from Payload richText structure
    const root = answer.root as Record<string, unknown> | undefined;
    if (root && Array.isArray(root.children)) {
      return (root.children as Array<Record<string, unknown>>)
        .map((child) => {
          const children = child.children as Array<Record<string, unknown>> | undefined;
          return children?.map((c) => String(c.text || "")).join("") || "";
        })
        .filter(Boolean)
        .join("\n");
    }
    return JSON.stringify(answer);
  };

  return (
    <section className="bg-neutral-50 section-px section-py" aria-label="常見問題">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <Heading as="h2" variant="h3">
            常見問題
          </Heading>
        </div>

        <div
          ref={ref}
          className="space-y-3"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
          }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-card px-5 shadow-sm transition-colors data-[state=open]:border-primary/20"
              >
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline md:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="pb-2 text-sm text-muted-foreground">
                    {answerText(faq.answer)}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
