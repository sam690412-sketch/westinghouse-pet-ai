import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { forwardRef } from "react";

export interface CTAAction {
  label: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
}

export interface CTAGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  primary: CTAAction;
  secondary?: CTAAction;
  tertiary?: CTAAction;
  layout?: "stack" | "inline" | "full-width";
}

export const CTAGroup = forwardRef<HTMLDivElement, CTAGroupProps>(
  ({ primary, secondary, tertiary, layout = "inline", className, ...props }, ref) => {
    const isStack = layout === "stack";
    const isFull = layout === "full-width";

    const renderButton = (action: CTAAction, isPrimary = false) => {
      const variant = action.variant || (isPrimary ? "default" : "outline");

      if (action.href) {
        return (
          <Button
            key={action.label}
            variant={variant}
            className={cn(
              "gap-2 transition-all active:scale-[0.98]",
              isFull && "w-full",
              isPrimary && "shadow-button hover:shadow-button-hover"
            )}
            asChild
          >
            <a href={action.href}>
              {action.icon}
              {action.label}
            </a>
          </Button>
        );
      }

      return (
        <Button
          key={action.label}
          variant={variant}
          onClick={action.onClick}
          className={cn(
            "gap-2 transition-all active:scale-[0.98]",
            isFull && "w-full",
            isPrimary && "shadow-button hover:shadow-button-hover"
          )}
        >
          {action.icon}
          {action.label}
        </Button>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          isStack && "flex-col gap-3",
          !isStack && "flex-row flex-wrap gap-3",
          className
        )}
        {...props}
      >
        {renderButton(primary, true)}
        {secondary && renderButton(secondary)}
        {tertiary && renderButton(tertiary)}
      </div>
    );
  }
);
CTAGroup.displayName = "CTAGroup";
