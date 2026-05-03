"use client";

import { BookOpen, CheckCircle, FileEdit, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface StatsCardsProps {
  totalCourses: number;
  published: number;
  draft: number;
  totalViews: number;
}

const StatsCards = ({
  totalCourses,
  published,
  draft,
  totalViews,
}: StatsCardsProps) => {
  const t = useTranslations("dashboard.admin-courses.stats");

  const stats = [
    {
      label: t("total"),
      value: totalCourses,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
      valueColor: "text-primary",
    },
    {
      label: t("published"),
      value: published,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      valueColor: "text-emerald-600",
    },
    {
      label: t("draft"),
      value: draft,
      icon: FileEdit,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      valueColor: "text-amber-600",
    },
    {
      label: t("totalViews"),
      value: totalViews,
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      valueColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "bg-white rounded-xl border border-gray-100 p-5",
            "flex flex-col items-start gap-3",
            "transition-all duration-200 hover:shadow-md",
          )}
        >
          <div className="flex items-center gap-2 w-full justify-start">
            <span className="text-sm font-medium text-gray-600">
              {stat.label}
            </span>
            <div className={cn("p-1.5 rounded-lg", stat.bgColor)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
          </div>
          <span
            className={cn("text-3xl font-bold", stat.valueColor)}
          >
            {stat.value.toLocaleString("ar-SA")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
