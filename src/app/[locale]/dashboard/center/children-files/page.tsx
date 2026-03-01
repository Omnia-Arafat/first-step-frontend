"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { useTranslations } from "next-intl";
import MonthlyAreaComparison from "@/components/charts/MonthlyAreaComparison";
import CircularProgressChart from "@/components/charts/CircularProgressChart";
import Children from "@/components/dashboard/children-files/Children";
import { useHasRole } from "@/store/authStore";
import { useCenterStats } from "@/hooks/useCenterStats";
import { Skeleton } from "@/components/ui/skeleton";

const CircularProgressSkeleton = () => {
  return (
    <div className="w-full h-[300px] rounded-xl bg-white p-6 flex flex-col items-center justify-center">
      <Skeleton className="w-32 h-32 rounded-full mb-4" />
      <Skeleton className="w-24 h-8 mb-2" />
      <Skeleton className="w-32 h-6" />
    </div>
  );
};

export default function CenterDashboardHome() {
  const meta = usePageMetadata();

  const t = useTranslations("dashboard.charts.children");
  const isCenter = useHasRole("center");
  const { stats, isLoading } = useCenterStats(isCenter ? "center" : "branch");

  // Build children comparison rows from enrollments_over_time
  const months = Object.keys(stats?.enrollments_over_time || {}).sort();
  const lastThreeMonths = months.slice(-3).reverse();

  function getMonthData(value: number, isUp: boolean) {
    const baseValues = [8, 10, 12, 17, 13, 15];
    if (isUp) {
      return baseValues.map((v) => ({ v: v + Math.floor(Math.random() * 5) }));
    } else {
      return baseValues.map((v) => ({ v: v - Math.floor(Math.random() * 5) }));
    }
  }

  const comparisonRows = lastThreeMonths.map((month) => {
    const currentValue = stats?.enrollments_over_time?.[month] || 0;
    const monthIndex = months.indexOf(month);
    const previousMonth = months[monthIndex - 1];
    const previousValue = previousMonth
      ? stats?.enrollments_over_time?.[previousMonth] || 0
      : 0;
    const isUp = currentValue > previousValue;
    return {
      value: currentValue,
      valueLabel: t("valueLabel"),
      trend: isUp ? ("up" as const) : ("down" as const),
      data: getMonthData(currentValue, isUp),
    };
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {isLoading ? (
          <CircularProgressSkeleton />
        ) : (
          <CircularProgressChart
            currentValue={stats?.total_children}
            title={t("title")}
            valueLabel={t("valueLabel")}
            capacityLabel={t("capacityLabel")}
          />
        )}
        {/* Children Comparison Chart */}
        {!isLoading && (
          <MonthlyAreaComparison
            title={t("comparison.title")}
            rows={comparisonRows}
          />
        )}
      </div>

      <div className="mt-6">
        <Children />
      </div>
    </div>
  );
}
