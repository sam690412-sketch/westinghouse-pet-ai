import { Heading, Text } from "@/components/atomic/Typography";
import { useStaggerAnimation } from "@/hooks/useScrollAnimation";
import type { CMSHowToStep } from "@/types/cms";

interface ProductHowToSectionProps {
  steps: CMSHowToStep[];
  productName: string;
}

export function ProductHowToSection({ steps, productName }: ProductHowToSectionProps) {
  const stagger = useStaggerAnimation(steps.length, { threshold: 0.1 });

  return (
    <section className="section-px section-py" aria-label="使用教學">
      <div className="mx-auto max-w-4xl">
        <Heading as="h2" variant="h3" className="mb-8 text-center">
          {productName} 使用方式
        </Heading>

        <div ref={stagger.ref} className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-border md:block" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative flex gap-4 md:gap-6"
                style={stagger.getDelayStyle(i)}
              >
                {/* Step number */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md">
                  {step.step}
                </div>

                {/* Content */}
                <div className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-card">
                  <Text variant="label" weight="semibold">
                    {step.title}
                  </Text>
                  {step.description && (
                    <Text variant="bodySmall" color="muted" className="mt-1">
                      {step.description}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
