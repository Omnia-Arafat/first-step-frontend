"use client";

import { cn } from "@/lib/utils";
import {
  ReservationStatus,
  useReservationStatus,
} from "@/components/tables/data/shared/status";

type ReservationStatusBadgeProps = {
  status: string | ReservationStatus;
  fallbackLabel?: string;
  className?: string;
};

export function ReservationStatusBadge({
  status,
  fallbackLabel,
  className,
}: ReservationStatusBadgeProps) {
  const { getStatusText, getStatusColorClass } = useReservationStatus();
  const colorClasses = getStatusColorClass(status);
  const text = fallbackLabel ?? (colorClasses ? getStatusText(status) : status);

  return (
    <div
      className={cn(
        "w-fit rounded-[4px] px-2 py-1 text-xs select-none",
        colorClasses,
        className
      )}
    >
      {text}
    </div>
  );
}
