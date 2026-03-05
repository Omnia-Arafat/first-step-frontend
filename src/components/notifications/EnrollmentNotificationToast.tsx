"use client";

import React from "react";
import { UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/store/authStore";

export interface EnrollmentData {
  id: number;
  user_id: number;
  center_id: number;
  center_branch_id: number;
  branch_price_id: number;
  reservation_number: string;
  status: string;
  enrollment_date: string;
  enrollment_type: string;
  parent_phone: string;
  price_amount: number;
  starting_date?: string;
  ending_date?: string;
  starting_time?: string;
  ending_time?: string;
  month?: string;
  day_string?: string;
}

export interface EnrollmentNotificationToastViewProps {
  title: string;
  description: string;
  enrollment: EnrollmentData;
  onView: () => void;
  onDismiss?: () => void;
}

const formatEnrollmentDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function EnrollmentNotificationToastView({
  title,
  description,
  enrollment,
  onView,
  onDismiss,
}: EnrollmentNotificationToastViewProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-lg shadow-lg border-l-4 border-l-blue-500 min-w-80 max-w-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-2 rounded-full bg-blue-100 text-blue-600">
          <UserPlus className="size-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Minimal Details */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pl-11">
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          <span>{formatEnrollmentDate(enrollment.enrollment_date)}</span>
        </div>
        <span>•</span>
        <span>#{enrollment.reservation_number}</span>
      </div>

      {/* Action Button */}
      <div className="pl-11">
        <Button
          onClick={() => {
            onView();
            onDismiss?.();
          }}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}

interface EnrollmentNotificationToastProps {
  title: string;
  description: string;
  enrollment: EnrollmentData;
  onDismiss?: () => void;
}

export function EnrollmentNotificationToast({
  title,
  description,
  enrollment,
  onDismiss,
}: EnrollmentNotificationToastProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const dashboardPath = user?.role === "parent" ? "parent" : "center";

  return (
    <EnrollmentNotificationToastView
      title={title}
      description={description}
      enrollment={enrollment}
      onDismiss={onDismiss}
      onView={() =>
        router.push(
          `/dashboard/${dashboardPath}/bookings?enrollmentId=${enrollment.id}`
        )
      }
    />
  );
}
