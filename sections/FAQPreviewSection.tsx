import { ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFAQs } from "@/hooks/useCMS";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { SectionTitle } from "@/components/atomic/SectionTitle";
import { Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQPreviewSection() {
  const { data: faqs, isLoading } = useFAQs(5);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="bg-neutral-50 section-px section-py"
      aria-label="常見問題"
    >
      <div className="mx-auto max-w-3xl">
        <SectionTitle
          title="常見問題"
          subtitle="快速找到您需要的解答"
          align="center"
        />

        {isLoading ? (
          <div className="mt-10 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "mt-10 transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="rounded-xl border border-border bg-card px-5 shadow-sm transition-colors data-[state=open]:border-primary/20"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline md:text-base">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Text variant="body" color="muted" className="pb-2 pl-6">
                      {faq.answer}
                    </Text>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 text-center">
              <Button variant="outline" className="gap-2" asChild>
                <a href="/faq">
                  查看所有常見問題
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
