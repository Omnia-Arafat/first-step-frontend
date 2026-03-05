"use client";

import { useTranslations, useLocale } from "next-intl";
import { PortfolioFormData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { centerService } from "@/services/dashboardApi";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  data: PortfolioFormData;
  onChange: (data: Partial<PortfolioFormData>) => void;
  errors?: Record<string, string[]>;
}

export const FacilitiesSection = ({ data, onChange, errors = {} }: Props) => {
  const t = useTranslations("dashboard.profileEditor.facilities");
  const locale = useLocale() as "ar" | "en";

  const { data: options, isLoading } = useQuery({
    queryKey: ["facilities-options"],
    queryFn: () => centerService.getOptions(),
  });

  const handleToggle = (optionId: number) => {
    const currentIds = data.admin_option_ids || [];
    const isSelected = currentIds.includes(optionId);

    onChange({
      admin_option_ids: isSelected
        ? currentIds.filter((id) => id !== optionId)
        : [...currentIds, optionId],
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="relative rounded-xl px-4 py-3 flex flex-col gap-3 min-w-[180px] grow bg-white"
          >
            <div className="absolute top-2 left-2">
              <Skeleton className="w-4 h-4 rounded-full" />
            </div>
            <Skeleton className="w-12 h-12 md:w-15 md:h-15 rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-start">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {options?.map((option: any) => {
          const isSelected = data.admin_option_ids?.includes(option.id);

          return (
            <div
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={cn(
                "relative group cursor-pointer transition-all duration-300",
                "rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[180px] grow",
                isSelected
                  ? "bg-linear-to-b from-white via-secondary-mint-green/12 to-secondary-mint-green/24"
                  : "bg-white hover:border-primary/30",
              )}
            >
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border transition-colors flex items-center justify-center",
                    isSelected
                      ? "bg-secondary-mint-green border-secondary-mint-green text-white"
                      : "border-gray-300 bg-white",
                  )}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-3" />}
                </div>
              </div>

              <div className="relative w-12 h-12 md:w-15 md:h-15">
                <Image
                  src={option.image}
                  alt={option.title?.[locale] || option.title}
                  fill
                  className="object-contain"
                />
              </div>

              <h4
                className={cn(
                  "heading-4 font-bold leading-tight",
                  isSelected ? "text-primary" : "text-mid-gray",
                )}
              >
                {option.title?.[locale] || option.title}
              </h4>
            </div>
          );
        })}
      </div>

      {errors.admin_option_ids && (
        <p className="text-sm text-destructive px-1">
          {errors.admin_option_ids[0]}
        </p>
      )}
    </div>
  );
};
