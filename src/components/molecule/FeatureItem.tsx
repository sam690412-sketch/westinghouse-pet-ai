import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/atomic/Typography";
import { forwardRef } from "react";

export interface FeatureItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  imageUrl?: string;
  reversed?: boolean;
}

export const FeatureItem = forwardRef<HTMLDivElement, FeatureItemProps>(
  ({ icon, title, description, imageUrl, reversed = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-6 md:flex-row md:items-center md:gap-10",
          reversed && "md:flex-row-reverse",
          className
        )}
        {...props}
      >
        {/* Image */}
        {imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:w-1/2">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className={cn("flex flex-col justify-center", imageUrl ? "md:w-1/2" : "md:w-full")}>
          {icon && (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <Heading variant="h4" className="mb-3">
            {title}
          </Heading>
          <Text variant="body" color="muted" className="max-w-lg">
            {description}
          </Text>
        </div>
      </div>
    );
  }
);
FeatureItem.displayName = "FeatureItem";
