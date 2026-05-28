import {
  Snowflake, Thermometer, Camera, Shield,
  Package, BatteryCharging, CheckCircle, Droplets,
  type LucideIcon,
} from "lucide-react";
import type { CMSFeature } from "@/types/cms";
import { Heading, Text } from "@/components/atomic/Typography";
import { useStaggerAnimation } from "@/hooks/useScrollAnimation";

interface ProductFeaturesSectionProps {
  features: CMSFeature[];
}

const iconMap: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  thermometer: Thermometer,
  camera: Camera,
  shield: Shield,
  package: Package,
  battery: BatteryCharging,
  "check-circle": CheckCircle,
  "battery-charging": BatteryCharging,
  droplets: Droplets,
};

function getIcon(name: string): LucideIcon {
  return iconMap[name] || CheckCircle;
}

export function ProductFeaturesSection({ features }: ProductFeaturesSectionProps) {
  const stagger = useStaggerAnimation(features.length, { threshold: 0.1 });

  return (
    <section className="bg-neutral-50 section-px section-py" aria-label="產品特色">
      <div className="mx-auto max-w-6xl">
        <Heading as="h2" variant="h3" className="mb-8 text-center">
          產品特色
        </Heading>

        <div
          ref={stagger.ref}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, i) => {
            const Icon = getIcon(feature.icon);
            return (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-card-hover"
                style={stagger.getDelayStyle(i)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <Text variant="label" weight="semibold" className="mt-3">
                  {feature.title}
                </Text>
                <Text variant="bodySmall" color="muted" className="mt-1">
                  {feature.description}
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
