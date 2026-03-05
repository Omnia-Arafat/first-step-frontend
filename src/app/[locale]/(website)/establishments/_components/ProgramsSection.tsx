"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  getBranchesForCenterAction,
  getBranchPricingAction,
} from "@/actions/nurseryActions";
import ProgramCard from "./ProgramCard";
import FilterDialog from "./FilterDialog";
import ReservationDialog from "./ReservationDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardIcons } from "@/components/general/icons";
import { cn } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import { AdminOption } from "@/types";

interface ProgramsSectionProps {
  centerId: string;
  nurseryName: string;
  locale: string;
  tNamespace?: string;
  adminOptions?: AdminOption[];
}

const ProgramsSection = ({
  centerId,
  nurseryName,
  locale,
  tNamespace = "nurseryDetails",
  adminOptions = [],
}: ProgramsSectionProps) => {
  const t = useTranslations(`${tNamespace}.programs` as any);
  const tCommon = useTranslations(`${tNamespace}.plans` as any);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );

  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationBranch, setReservationBranch] = useState<string>("");
  const [reservationPlanId, setReservationPlanId] = useState<
    number | undefined
  >(undefined);

  const [filters, setFilters] = useState({
    branches: [] as string[],
    programTypes: [] as string[],
    ages: [] as string[],
  });

  const { data: branchesResponse, isLoading: loadingBranches } = useQuery({
    queryKey: ["branches-for-center", centerId],
    queryFn: () => getBranchesForCenterAction(centerId),
    enabled: !!centerId,
  });

  const branches = useMemo(() => {
    return (branchesResponse?.data || []).map((b: any) => ({
      id: String(b.id),
      label: b.nursery_name || b.name || "Branch",
    }));
  }, [branchesResponse]);

  const branchIds = useMemo(() => branches.map((b) => b.id), [branches]);

  const activeBranchIds =
    filters.branches.length > 0
      ? filters.branches
      : branchIds.length > 0
        ? [branchIds[0]]
        : [];

  const { data: allPlans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["branch-pricing-all", activeBranchIds, centerId],
    queryFn: async () => {
      const results = await Promise.all(
        activeBranchIds.map((id) => getBranchPricingAction(id, centerId)),
      );
      return results.flat();
    },
    enabled: activeBranchIds.length > 0,
  });

  const hasActiveFilters = useMemo(() => {
    return (
      filters.branches.length > 0 ||
      filters.programTypes.length > 0 ||
      filters.ages.length > 0
    );
  }, [filters]);

  const resetFilters = () => {
    setFilters({ branches: [], programTypes: [], ages: [] });
  };

  const filteredPrograms = useMemo(() => {
    return allPlans.filter((p) => {
      if (
        filters.programTypes.length > 0 &&
        !filters.programTypes.includes(p.enrollment_type)
      ) {
        return false;
      }

      if (filters.ages.length > 0) {
        const sAge =
          typeof p.start_age === "number" ? p.start_age : p.start_age.age;
        const sType =
          typeof p.start_age === "number" ? "year" : p.start_age.type;
        const eAge = typeof p.end_age === "number" ? p.end_age : p.end_age.age;
        const eType = typeof p.end_age === "number" ? "year" : p.end_age.type;

        const startInMonths = sType === "month" ? sAge : sAge * 12;
        const endInMonths = eType === "month" ? eAge : eAge * 12;

        const matchesAge = filters.ages.some((filterId) => {
          switch (filterId) {
            case "0_6_months":
              return startInMonths <= 6 && endInMonths >= 0;
            case "6_12_months":
              return startInMonths <= 12 && endInMonths >= 6;
            case "1_3_years":
              return startInMonths <= 36 && endInMonths >= 12;
            case "3_5_years":
              return startInMonths <= 60 && endInMonths >= 36;
            default:
              return false;
          }
        });

        if (!matchesAge) return false;
      }

      return true;
    });
  }, [allPlans, filters]);

  const getDurationLabel = (count: number, type: string) => {
    const unitLabel =
      tCommon(`units.${count === 1 ? type : type + "s"}`) || type;
    return `${count} ${unitLabel}`;
  };

  const selectedProgram = filteredPrograms.find(
    (p) => String(p.id) === selectedProgramId,
  );

  const handleBooking = () => {
    if (selectedProgram) {
      const branchId = filters.branches[0] || activeBranchIds[0];
      setReservationBranch(branchId);
      setReservationPlanId(selectedProgram.id);
      setIsReservationOpen(true);
    }
  };

  return (
    <section id="programs" className="py-0 scroll-mt-20">
      <SectionHeader
        title={t("title")}
        countText={t("count", { count: filteredPrograms.length })}
      >
        <button
          className="cursor-pointer text-primary"
          onClick={() => setIsFilterOpen(true)}
        >
          <dashboardIcons.multiFilter />
        </button>
      </SectionHeader>

      <div className="bg-white-out rounded-2xl p-4 flex flex-col gap-6">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
          {loadingPlans || loadingBranches ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white px-2 py-4 rounded-2xl flex items-center justify-between gap-8"
              >
                <Skeleton className="h-7 flex-1 max-w-[40%]" />
                <div className="flex-1 flex items-center justify-between gap-4">
                  <Skeleton className="h-5 w-24" />
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              </div>
            ))
          ) : allPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-[32px] border border-gray-100 shadow-xs animate-in fade-in zoom-in duration-500">
              <div className="relative w-48 h-40 mb-8 opacity-40">
                <Image
                  src="/assets/illustrations/empty-cloud.png"
                  alt="No Programs"
                  fill
                  className="object-contain grayscale"
                />
              </div>

              <div className="space-y-3 max-w-xs text-center">
                <h3 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                  {tCommon("noPrograms")}
                </h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  {tCommon("noProgramsMessage")}
                </p>
              </div>
            </div>
          ) : filteredPrograms.length > 0 ? (
            filteredPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                title={program.title}
                durationLabel={getDurationLabel(
                  program.count,
                  program.enrollment_type,
                )}
                price={program.price_amount}
                isSelected={String(program.id) === selectedProgramId}
                onClick={() => setSelectedProgramId(String(program.id))}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-6 bg-white rounded-[32px] border border-gray-100 shadow-xs animate-in fade-in zoom-in duration-500">
              <div className="relative w-38 h-30 mb-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/assets/illustrations/abstract-search.png"
                  alt="No Results"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-3 max-w-xs text-center">
                <h3 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                  {t("noResults")}
                </h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  {t("noResultsDescription")}
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="cursor-pointer mt-8 text-secondary-mint-green font-bold text-sm hover:text-secondary-mint-green/80 transition-colors flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary-mint-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <dashboardIcons.multiFilter className="w-4 h-4" />
                  </div>
                  {t("resetFilters")}
                </button>
              )}
            </div>
          )}
        </div>

        {filteredPrograms.length > 0 && (
          <Button
            size="long"
            onClick={handleBooking}
            disabled={!selectedProgramId}
            className="w-full! max-w-none"
          >
            {t("bookNow")}
          </Button>
        )}
      </div>

      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        branches={branches}
        selectedFilters={filters}
        onApply={setFilters}
        onReset={() => setFilters({ branches: [], programTypes: [], ages: [] })}
      />

      <ReservationDialog
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        nurseryName={nurseryName}
        selectedBranch={reservationBranch}
        selectedPlanId={reservationPlanId}
        locale={locale as "ar" | "en"}
        adminOptions={adminOptions}
      />
    </section>
  );
};

export default ProgramsSection;
