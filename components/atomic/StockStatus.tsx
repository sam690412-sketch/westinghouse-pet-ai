import { Check, X, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "./Typography";
import { forwardRef } from "react";

type StockLevel = "in_stock" | "low_stock" | "out_of_stock" | "pre_order";

interface StockConfig {
  icon: typeof Check;
  label: string;
  colorClass: string;
  dotClass: string;
}

const stockConfig: Record<StockLevel, StockConfig> = {
  in_stock: {
    icon: Check,
    label: "現貨",
    colorClass: "text-success",
    dotClass: "bg-success",
  },
  low_stock: {
    icon: AlertTriangle,
    label: "庫存緊張",
    colorClass: "text-warning",
    dotClass: "bg-warning",
  },
  out_of_stock: {
    icon: X,
    label: "暫時缺貨",
    colorClass: "text-error",
    dotClass: "bg-error",
  },
  pre_order: {
    icon: Clock,
    label: "預購",
    colorClass: "text-info",
    dotClass: "bg-info",
  },
};

export interface StockStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StockLevel;
  quantity?: number;
  showDot?: boolean;
  showIcon?: boolean;
}

export const StockStatus = forwardRef<HTMLDivElement, StockStatusProps>(
  ({ status, quantity, showDot = true, showIcon = false, className, ...props }, ref) => {
    const config = stockConfig[status];
    const Icon = config.icon;

    return (
      <div ref={ref} className={cn("flex items-center gap-1.5", className)} {...props}>
        {showDot && (
          <span className={cn("h-2 w-2 rounded-full", config.dotClass)} aria-hidden="true" />
        )}
        {showIcon && (
          <Icon className={cn("h-4 w-4", config.colorClass)} aria-hidden="true" />
        )}
        <Text variant="caption" className={config.colorClass} weight="medium">
          {config.label}
          {quantity !== undefined && status === "in_stock" && ` (${quantity}件)`}
          {quantity !== undefined && status === "low_stock" && ` (剩${quantity}件)`}
        </Text>
      </div>
    );
  }
);
StockStatus.displayName = "StockStatus";
