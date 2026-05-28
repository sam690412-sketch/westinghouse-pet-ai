import { ArrowRight, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden section-px section-py-lg"
      aria-label="行動呼籲"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-brand-blue-dark" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div
        className={cn(
          "relative z-10 mx-auto max-w-3xl text-center",
          "transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
          <PawPrint className="h-7 w-7 text-white" />
        </div>

        <Heading as="h2" variant="h2" className="text-white">
          毛孩值得最好的，不是嗎？
        </Heading>

        <Text variant="bodyLarge" className="mx-auto mt-4 max-w-xl text-white/80">
          已經有超過 10,000 位飼主選擇了我們。你不在家時，讓 Westinghouse Pet 替你守護牠。
        </Text>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg"
            asChild
          >
            <a href="/products">
              幫毛孩挑一個
              <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <a href="/contact">還有疑問？問問我們</a>
          </Button>
        </div>

        <Text variant="caption" className="mt-6 text-white/60">
          滿 NT$1,500 免運到家 &middot; 15 天試用不滿意全額退 &middot; 一年原廠保固 &middot; 10分鐘內客服回覆
        </Text>
      </div>
    </section>
  );
}
