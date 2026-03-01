"use client";

import { useTranslations } from "next-intl";
import { useCenterStats } from "@/hooks/useCenterStats";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useHasRole } from "@/store/authStore";

export const useStatusNumbers = () => {
  const t = useTranslations("shared.status");
  const isAdmin = useHasRole("admin");
  const isCenter = useHasRole(["center", "nursery"]);

  const { stats: centerStats } = useCenterStats(isCenter ? "center" : "branch");
  const { stats: adminStats } = useAdminStats();

  const stats = isAdmin ? adminStats : centerStats;

  const statusBreakdown = stats?.enrollment_status_breakdown || {
    waitingForConfirmation: 0,
    waitingForPayment: 0,
    rejected: 0,
    confirmed: 0,
  };

  const numbers = {
    rejected: {
      title: t("rejected"),
      value: statusBreakdown.rejected,
      color: "#F6D6D5",
    },
    waitingForConfirmation: {
      title: t("waitingForConfirmation"),
      value: statusBreakdown.waitingForConfirmation,
      color: "#FFECC5",
    },
    waitingForPayment: {
      title: t("waitingForPayment"),
      value: statusBreakdown.waitingForPayment,
      color: "#F87070",
    },
    confirmed: {
      title: t("confirmed"),
      value: statusBreakdown.confirmed,
      color: "#B1CDFB",
    },
  };

  return numbers;
};

interface CardProps {
  title: string;
  value: number;
  color: string;
}

const Card = ({ title, value, color }: CardProps) => {
  return (
    <div
      className="rounded-xl px-4 py-2 min-w-fit text-primary font-bold"
      style={{ background: color }}
    >
      <p className="whitespace-nowrap">{title}</p>
      <p className="text-4xl">{value}</p>
    </div>
  );
};

const StatusNumbers = () => {
  const numbers = useStatusNumbers();

  return (
    <div className="grow">
      <div className="grid grid-cols-2 gap-4">
        {Object.values(numbers).map((item) => (
          <Card key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
};

export default StatusNumbers;
