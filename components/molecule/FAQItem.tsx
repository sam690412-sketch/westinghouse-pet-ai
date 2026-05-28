import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface FAQItemProps extends React.HTMLAttributes<HTMLDivElement> {
  question: string;
  answer: string;
  value: string;
  defaultOpen?: boolean;
}

export const FAQItem = forwardRef<HTMLDivElement, FAQItemProps>(
  ({ question, answer, value, defaultOpen = false, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
        <AccordionItem
          value={value}
          className="rounded-lg border border-border bg-card px-4 data-[state=open]:border-primary/20"
        >
          <AccordionTrigger className="py-4 text-left text-base font-medium hover:no-underline [&[data-state=open]>svg]:rotate-180">
            {question}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground">
            {answer}
          </AccordionContent>
        </AccordionItem>
      </div>
    );
  }
);
FAQItem.displayName = "FAQItem";
