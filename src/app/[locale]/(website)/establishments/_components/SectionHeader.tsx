"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface SectionHeaderProps {
  title: string;
  countText?: ReactNode;
  children?: ReactNode;
  className?: string;
  showNavigation?: boolean;
}

const SectionHeader = ({
  title,
  countText,
  children,
  className,
  showNavigation = false,
}: SectionHeaderProps) => {
  return (
    <div
      className={cn("flex items-center justify-between mb-8 gap-4", className)}
    >
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-primary rounded-full shrink-0" />
        <h2 className="heading-4 font-bold text-primary">
          {title}{" "}
          {countText && (
            <span className="text:lg md:text-xl text-primary font-medium">
              {countText}
            </span>
          )}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {children}
        {showNavigation && (
          <>
            <CarouselPrevious
              useChevron
              className="static translate-y-0 translate-x-0 w-6 h-6 border-2 border-secondary-mint-green! text-secondary-mint-green shadow-none disabled:border-light-gray! disabled:text-light-gray"
            />
            <CarouselNext
              useChevron
              className="static translate-y-0 translate-x-0 w-6 h-6 border-2 border-secondary-mint-green! text-secondary-mint-green shadow-none disabled:border-light-gray! disabled:text-light-gray"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
