import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useProblemSolutions } from "@/hooks/useCMS";
import { useStaggerAnimation } from "@/hooks/useScrollAnimation";
import { SectionTitle } from "@/components/atomic/SectionTitle";
import { Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";

export function ProblemSolutionSection() {
  const { data: items, isLoading } = useProblemSolutions();
  const stagger = useStaggerAnimation(items?.length ?? 0, { threshold: 0.1 });

  return (
    <section className="section-px section-py" aria-label="問題與解決方案">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          title="您的困擾，我們都懂"
          subtitle="從飼主真實需求出發，打造真正有用的智能產品"
          align="center"
        />

        {isLoading ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div
              ref={stagger.ref}
              className="mt-10 grid gap-4 lg:grid-cols-2"
            >
              {items?.map((item, i) => (
                <div
                  key={i}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover sm:flex-row sm:items-start"
                  style={stagger.getDelayStyle(i)}
                >
                  {/* Problem */}
                  <div className="flex items-start gap-3 sm:w-1/2">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10">
                      <AlertCircle className="h-4 w-4 text-error" />
                    </div>
                    <div>
                      <Text variant="caption" color="muted" className="uppercase tracking-wide">
                        困擾
                      </Text>
                      <Text variant="body" className="mt-0.5">
                        {item.problem}
                      </Text>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden shrink-0 items-center self-center text-muted-foreground sm:flex">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Solution */}
                  <div className="flex items-start gap-3 sm:w-1/2">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <Text variant="caption" color="muted" className="uppercase tracking-wide">
                        解決方案
                      </Text>
                      <Text variant="bodySmall" className="mt-0.5">
                        {item.solution}
                      </Text>
                      {item.productSlug && (
                        <a
                          href={`/products/${item.productSlug}`}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          查看產品
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button className="gap-2" asChild>
                <a href="/products">
                  找到適合您的產品
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
