import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";
import { forwardRef } from "react";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-button hover:shadow-button-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95",
        ghost: "hover:bg-muted active:scale-95",
        outline: "border border-border bg-transparent hover:bg-muted active:scale-95",
        danger: "bg-error text-white hover:bg-error-dark active:scale-95",
      },
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon;
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon: Icon, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      >
        <Icon className={cn(
          size === "sm" && "h-4 w-4",
          size === "md" && "h-5 w-5",
          size === "lg" && "h-6 w-6",
          size === "xl" && "h-7 w-7",
        )} aria-hidden="true" />
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
