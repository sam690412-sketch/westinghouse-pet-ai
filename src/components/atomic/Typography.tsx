import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import React, { forwardRef } from "react";

// ============================================================
// HEADING
// ============================================================
const headingVariants = cva("font-sans tracking-tight", {
  variants: {
    variant: {
      h1: "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
      h2: "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
      h3: "text-2xl md:text-3xl font-semibold leading-snug",
      h4: "text-xl md:text-2xl font-semibold leading-snug",
      h5: "text-lg md:text-xl font-medium leading-snug",
      h6: "text-base md:text-lg font-medium leading-snug",
    },
    color: {
      default: "text-foreground",
      primary: "text-primary",
      muted: "text-muted-foreground",
      white: "text-white",
      brand: "text-brand-blue",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "h2",
    color: "default",
    align: "left",
  },
});

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color" | "align">,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, color, align, as: Comp = "h2", ...props }, ref) => {
    return React.createElement(Comp, {
      ref,
      className: cn(headingVariants({ variant, color, align, className })),
      ...props,
    });
  }
);

// ============================================================
// TEXT / BODY
// ============================================================
const textVariants = cva("font-sans", {
  variants: {
    variant: {
      body: "text-base leading-relaxed",
      bodySmall: "text-sm leading-relaxed",
      bodyLarge: "text-lg leading-relaxed",
      caption: "text-xs leading-normal",
      overline: "text-xs font-semibold uppercase tracking-widest",
      label: "text-sm font-medium",
      button: "text-sm font-semibold",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      accent: "text-accent",
      white: "text-white",
      success: "text-success",
      warning: "text-warning",
      error: "text-error",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
    weight: "normal",
    align: "left",
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color" | "align">,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label";
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, color, weight, align, as: Comp = "p", ...props }, ref) => {
    return React.createElement(Comp, {
      ref,
      className: cn(textVariants({ variant, color, weight, align, className })),
      ...props,
    });
  }
);

// ============================================================
// EXPORTS
// ============================================================
export { headingVariants, textVariants };
