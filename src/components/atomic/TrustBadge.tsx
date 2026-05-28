import { Shield, Truck, RotateCcw, Headphones, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "./Typography";
import { forwardRef } from "react";

const iconMap = {
  shield: Shield,
  truck: Truck,
  rotateCcw: RotateCcw,
  headphones: Headphones,
  award: Award,
  clock: Clock,
};

export interface TrustBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: keyof typeof iconMap;
  label: string;
  description?: string;
  variant?: "default" | "compact" | "vertical";
  color?: "primary" | "success" | "muted";
}

export const TrustBadge = forwardRef<HTMLDivElement, TrustBadgeProps>(
  ({ icon, label, description, variant = "default", color = "muted", className, ...props }, ref) => {
    const Icon = iconMap[icon];
    const colorClass = {
      primary: "text-primary bg-primary/10",
      success: "text-success bg-success/10",
      muted: "text-muted-foreground bg-muted",
    }[color];

    if (variant === "compact") {
      return (
        <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", colorClass)}>
            <Icon className="h-3 w-3" aria-hidden="true" />
          </div>
          <Text variant="caption" weight="medium">{label}</Text>
        </div>
      );
    }

    if (variant === "vertical") {
      return (
        <div ref={ref} className={cn("flex flex-col items-center gap-2 text-center", className)} {...props}>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", colorClass)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <Text variant="label" weight="semibold">{label}</Text>
          {description && <Text variant="caption" color="muted">{description}</Text>}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("flex items-center gap-3", className)} {...props}>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colorClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <Text variant="label" weight="semibold">{label}</Text>
          {description && <Text variant="caption" color="muted">{description}</Text>}
        </div>
      </div>
    );
  }
);
TrustBadge.displayName = "TrustBadge";
