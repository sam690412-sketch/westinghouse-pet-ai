import { Heading, Text } from "./Typography";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
  withLine?: boolean;
  lineColor?: "primary" | "accent" | "muted";
}

export const SectionTitle = forwardRef<HTMLDivElement, SectionTitleProps>(
  ({ title, subtitle, align = "center", size = "lg", withLine = true, lineColor = "primary", className, ...props }, ref) => {
    const alignClass = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";
    
    const lineColorClass = {
      primary: "bg-primary",
      accent: "bg-accent",
      muted: "bg-muted-foreground/30",
    }[lineColor];

    return (
      <div ref={ref} className={cn("flex flex-col gap-3", alignClass, className)} {...props}>
        {withLine && (
          <div className={cn("h-1 w-12 rounded-full", lineColorClass)} aria-hidden="true" />
        )}
        <Heading
          variant={size === "lg" ? "h2" : size === "md" ? "h3" : "h4"}
          align={align}
          className="text-balance"
        >
          {title}
        </Heading>
        {subtitle && (
          <Text variant="bodyLarge" color="muted" align={align} className="max-w-2xl text-balance">
            {subtitle}
          </Text>
        )}
      </div>
    );
  }
);
SectionTitle.displayName = "SectionTitle";
