import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef, useCallback, useState } from "react";

export interface QuantitySelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  disabled?: boolean;
}

export const QuantitySelector = forwardRef<HTMLDivElement, QuantitySelectorProps>(
  ({ value: controlledValue, min = 1, max = 99, onChange, size = "md", disabled = false, className, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(min);
    const value = controlledValue ?? internalValue;

    const update = useCallback((newVal: number) => {
      const clamped = Math.max(min, Math.min(max, newVal));
      if (controlledValue === undefined) setInternalValue(clamped);
      onChange?.(clamped);
    }, [min, max, controlledValue, onChange]);

    const decrement = () => update(value - 1);
    const increment = () => update(value + 1);

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-lg border border-border bg-background",
          size === "sm" && "h-8",
          size === "md" && "h-10",
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || value <= min}
          className={cn(
            "flex items-center justify-center rounded-l-lg transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent",
            size === "sm" && "h-8 w-8",
            size === "md" && "h-10 w-10",
          )}
          aria-label="減少數量"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>

        <span
          className={cn(
            "flex items-center justify-center border-x border-border bg-muted/30 font-semibold tabular-nums select-none",
            size === "sm" && "h-8 w-10 text-sm",
            size === "md" && "h-10 w-12 text-base",
          )}
          role="status"
          aria-live="polite"
          aria-label={`數量: ${value}`}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={increment}
          disabled={disabled || value >= max}
          className={cn(
            "flex items-center justify-center rounded-r-lg transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent",
            size === "sm" && "h-8 w-8",
            size === "md" && "h-10 w-10",
          )}
          aria-label="增加數量"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }
);
QuantitySelector.displayName = "QuantitySelector";
