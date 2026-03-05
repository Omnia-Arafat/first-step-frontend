"use client";

import { useState } from "react";
import CenterCard from "./CenterCard";
import { useCenters } from "@/hooks/useBranches";
import { useTranslations } from "next-intl";
import EmptyState from "@/components/common/EmptyState";
import { FilterButtons } from "@/components/common/FilterButtons";
import { Skeleton } from "@/components/ui/skeleton";

function CenterCardSkeleton() {
  return (
    <div className="relative bg-sidebar border-b border-light-gray p-6 flex flex-col lg:flex-row gap-8">
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex items-center gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      <div className="flex flex-col gap-y-6 flex-1">
        <div className="flex items-start gap-4">
          <Skeleton className="size-20 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 lg:gap-4 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <div className="flex gap-5 lg:gap-x-10">
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      <div className="flex flex-col gap-y-4 min-w-[220px]">
        <div>
          <Skeleton className="mb-3 h-7 w-36" />
          <div className="flex flex-col gap-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div>
          <Skeleton className="mb-3 h-7 w-28" />
          <div className="flex flex-col gap-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

const Centers = () => {
  const { data: centers, isLoading, error } = useCenters();
  const t = useTranslations("dashboard.admin.center");
  const [activeFilter, setActiveFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CenterCardSkeleton key={index} />
        ))}
      </div>
    );
  }
  if (error) return <div>{t("error.load")}</div>;

  // Show empty state if no centers at all (before filtering)
  if (!centers || centers.length === 0) {
    return (
      <EmptyState
        icon="🏢"
        size="lg"
        translationKey="dashboard.emptyStates.centers"
      />
    );
  }

  const counts = {
    all: centers.length,
    pending: centers.filter((c: any) => c.status === "pending").length,
    confirmed: centers.filter((c: any) => c.status === "confirmed").length,
    canceled: centers.filter((c: any) => c.status === "canceled").length,
  };

  const filterOptions = [
    { value: "all", label: t("status.all"), count: counts.all },
    { value: "pending", label: t("status.pending"), count: counts.pending },
    {
      value: "confirmed",
      label: t("status.confirmed"),
      count: counts.confirmed,
    },
    { value: "canceled", label: t("status.canceled"), count: counts.canceled },
  ];

  const filteredCenters = centers.filter((center: any) => {
    if (activeFilter === "all") return true;
    return center.status === activeFilter;
  });

  return (
    <div className="flex flex-col gap-4">
      <FilterButtons
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {filteredCenters.length > 0 ? (
        filteredCenters.map((center: any) => (
          <CenterCard key={center.id} center={center} />
        ))
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p className="text-muted-foreground">{t("noResults")}</p>
        </div>
      )}
    </div>
  );
};

export default Centers;
