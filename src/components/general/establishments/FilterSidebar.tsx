"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  SlidersHorizontal,
  Check,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterState {
  categories: string[];
  cities: string[];
  ages: string[];
  ratings: string[];
}

interface FilterSidebarProps {
  cities: FilterOption[];
  categoryServices: FilterOption[];
  selectedFilters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  locale: string;
}

const ageOptions: FilterOption[] = [
  { id: "infant", label: "رضيع" },
  { id: "0-6-months", label: "من 0 الى 6 أشهر" },
  { id: "6-12-months", label: "من 6 أشهر إلى سنة" },
  { id: "1-3-years", label: "من سنة إلى 3 سنوات" },
  { id: "3-5-years", label: "من 3 سنوات إلى 5 سنوات" },
  { id: "5-6-years", label: "من 5 سنوات إلى 6 سنوات" },
];

const ratingOptions: FilterOption[] = [
  { id: "5", label: "5 نجوم" },
  { id: "4", label: "4 نجوم" },
  { id: "3", label: "3 نجوم" },
  { id: "2", label: "نجمتين" },
];

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedIds: string[];
  allLabel: string;
  onChange: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const FilterSection = ({
  title,
  options,
  selectedIds,
  allLabel,
  onChange,
  isExpanded,
  onToggleExpand,
}: FilterSectionProps) => {
  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={onToggleExpand}
        className="flex items-center justify-between w-full py-2 text-right"
      >
        <span className="text-lg font-bold text-primary">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-3 mt-3 pr-1 max-h-[241px] overflow-y-auto custom-scrollbar">
          {/* "All" Option */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onChange("all")}
          >
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                selectedIds.length === 0
                  ? "bg-primary border-primary"
                  : "border-gray-300 group-hover:border-gray-400",
              )}
            >
              {selectedIds.length === 0 && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span
              className={cn(
                "text-sm transition-colors",
                selectedIds.length === 0
                  ? "text-primary font-medium"
                  : "text-gray-500 group-hover:text-gray-700",
              )}
            >
              {allLabel}
            </span>
          </div>

          {/* Options */}
          {options.map((option) => {
            const isSelected = selectedIds.includes(option.id);
            return (
              <div
                key={option.id}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => onChange(option.id)}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-gray-300 group-hover:border-gray-400",
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    isSelected
                      ? "text-primary font-medium"
                      : "text-gray-500 group-hover:text-gray-700",
                  )}
                >
                  {option.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FilterSidebarContent = ({
  cities,
  categoryServices,
  selectedFilters,
  onFiltersChange,
  locale,
}: FilterSidebarProps) => {
  const t = useTranslations("filterSidebar");
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    cities: true,
    ages: true,
    ratings: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (category: keyof FilterState, id: string) => {
    const current = selectedFilters[category];

    if (id === "all") {
      onFiltersChange({
        ...selectedFilters,
        [category]: [],
      });
      return;
    }

    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];

    onFiltersChange({
      ...selectedFilters,
      [category]: next,
    });
  };

  const totalActiveFilters =
    selectedFilters.categories.length +
    selectedFilters.cities.length +
    selectedFilters.ages.length +
    selectedFilters.ratings.length;

  const resetAllFilters = () => {
    onFiltersChange({
      categories: [],
      cities: [],
      ages: [],
      ratings: [],
    });
  };

  const translatedAgeOptions = ageOptions.map((opt: FilterOption) => ({
    ...opt,
    label: t(`ages.${opt.id}`) || opt.label,
  }));

  const translatedRatingOptions = ratingOptions.map((opt: FilterOption) => ({
    ...opt,
    label: locale === "ar" ? opt.label : `${opt.id} Stars`,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full" />
          {t("title")}
        </h2>
        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllFilters}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            {locale === "ar" ? "إعادة تعيين" : "Reset"}
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <FilterSection
          title={t("categories.title")}
          options={categoryServices}
          selectedIds={selectedFilters.categories}
          allLabel={t("categories.all")}
          onChange={(id) => toggleFilter("categories", id)}
          isExpanded={expandedSections.categories}
          onToggleExpand={() => toggleSection("categories")}
        />

        <FilterSection
          title={t("cities.title")}
          options={cities}
          selectedIds={selectedFilters.cities}
          allLabel={t("cities.all")}
          onChange={(id) => toggleFilter("cities", id)}
          isExpanded={expandedSections.cities}
          onToggleExpand={() => toggleSection("cities")}
        />

        <FilterSection
          title={t("ages.title")}
          options={translatedAgeOptions}
          selectedIds={selectedFilters.ages}
          allLabel={t("ages.all")}
          onChange={(id) => toggleFilter("ages", id)}
          isExpanded={expandedSections.ages}
          onToggleExpand={() => toggleSection("ages")}
        />

        <FilterSection
          title={t("ratings.title")}
          options={translatedRatingOptions}
          selectedIds={selectedFilters.ratings}
          allLabel={t("ratings.all")}
          onChange={(id) => toggleFilter("ratings", id)}
          isExpanded={expandedSections.ratings}
          onToggleExpand={() => toggleSection("ratings")}
        />
      </div>
    </div>
  );
};

interface FilterSidebarExportProps extends FilterSidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FilterSidebar = (props: FilterSidebarExportProps) => {
  const t = useTranslations("filterSidebar");

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-44 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <FilterSidebarContent {...props} />
        </div>
      </aside>

      {/* Mobile Sheet - controlled from parent */}
      <Sheet open={props.isOpen} onOpenChange={props.onOpenChange}>
        <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
          {/* Custom close button for RTL - positioned on left */}
          {/* Default close button provided by SheetContent */}
          <div className="p-5 pt-14 h-full overflow-y-auto">
            <FilterSidebarContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FilterSidebar;
