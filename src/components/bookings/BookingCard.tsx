"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReservationStatusBadge } from "@/components/shared/ReservationStatusBadge";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

interface BookingCardProps {
  booking: any;
  onShowDetails: () => void;
  onCancel?: () => void;
  onRenew?: () => void;
  onConfirmReservation?: () => void;
  cancellingId?: number | null;
  renewingId?: number | null;
}

export default function BookingCard({
  booking,
  onShowDetails,
  onCancel,
  onRenew,
  onConfirmReservation,
  cancellingId,
  renewingId,
}: BookingCardProps) {
  const t = useTranslations("dashboard.parent.bookings");

  const STATUS_MAP: Record<string, string> = {
    pending: t("status.pending"),
    accepted: t("status.accepted"),
    existing: t("status.existing"),
    paid: t("status.paid"),
    expired: t("status.expired"),
    rejected: t("status.rejected"),
    canceled: t("status.canceled"),
    cancelled: t("status.cancelled"),
    waiting_confirmation: t("status.waiting_confirmation"),
  };

  const actionsByStatus: Record<
    string,
    {
      label: string;
      variant?: "destructive" | "default";
      action: "details" | "cancel" | "renew" | "confirmReservation" | null;
    }[]
  > = {
    [t("status.accepted")]: [
      { label: t("actions.confirmReservation"), action: "confirmReservation" },
      { label: t("actions.cancel"), variant: "destructive", action: "cancel" },
    ],
    [t("status.paid")]: [
      { label: t("actions.showDetails"), action: "details" },
      { label: t("actions.renew"), action: "renew" },
    ],
    [t("status.existing")]: [
      { label: t("actions.showDetails"), action: "details" },
      { label: t("actions.renew"), action: "renew" },
    ],
    [t("status.expired")]: [
      { label: t("actions.showDetails"), action: "details" },
      { label: t("actions.renew"), action: "renew" },
    ],
    [t("status.rejected")]: [
      { label: t("actions.showDetails"), action: "details" },
      { label: t("actions.renew"), action: "renew" },
    ],
    [t("status.canceled")]: [
      { label: t("actions.showDetails"), action: "details" },
      { label: t("actions.renew"), action: "renew" },
    ],
    [t("status.waiting_confirmation")]: [
      { label: t("actions.showDetails"), action: "details" },
    ],
    [t("status.pending")]: [
      { label: t("actions.showDetails"), action: "details" },
      { label: t("actions.cancel"), variant: "destructive", action: "cancel" },
    ],
  };

  const tLabels = useTranslations("reservationForm.labels");
  const tSummary = useTranslations("reservationForm.summary");

  const getCountLabel = (type: string) => {
    switch (type) {
      case "hour":
        return tLabels("numberOfHours");
      case "week":
        return tLabels("numberOfWeeks");
      case "month":
        return tLabels("numberOfMonths");
      default:
        return tLabels("numberOfDays");
    }
  };

  const isHourly = booking.enrollment_type === "hour";

  const rightFields = [
    { key: "status", label: t("fields.status"), isStatus: true },
    {
      key: "startDay",
      label: isHourly ? tSummary("date") : t("fields.startDay"),
    },
    {
      key: "endDay",
      label: isHourly ? tSummary("time") : t("fields.endDay"),
    },
    { key: "daysCount", label: getCountLabel(booking.enrollment_type) },
  ];

  const leftFields = [
    { key: "childName", label: t("fields.childName") },
    { key: "className", label: t("fields.className") },
    { key: "branch", label: t("fields.branch") },
    { key: "program", label: t("fields.program") },
    { key: "paymentMethod", label: t("fields.paymentMethod") },
  ];

  // Filter actions logic
  const allActions = actionsByStatus[STATUS_MAP[booking.status]] || [];
  const filteredActions = allActions.filter((action) => {
    if (
      action.action === "cancel" &&
      (booking.status === "waiting_confirmation" || !onCancel)
    ) {
      return false;
    }
    if (action.action === "renew" && !onRenew) {
      return false;
    }
    if (action.action === "confirmReservation" && !onConfirmReservation) {
      return false;
    }
    return true;
  });
  const isOnlyButton = filteredActions.length === 1;
  const hasOtherButton = filteredActions?.some(
    (a) => a.action === "renew" || a.action === "cancel"
  );

  return (
    <Card
      id={`enrollment-${booking.id}`}
      className="p-6 hover:shadow-lg transition-all border border-gray-200"
    >
      <div className="space-y-4">
        {/* Details Grid - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3 text-sm">
          {/* Left Fields Column */}
          <div className="space-y-3">
            {leftFields.map((field, idx) => (
              <div
                key={field.key + "-" + idx}
                className="flex justify-between items-center"
              >
                <span className="font-semibold text-primary">
                  {field.label}
                </span>
                <span className="text-mid-gray font-bold">
                  {booking[field.key]}
                </span>
              </div>
            ))}
          </div>

          {/* Right Fields Column */}
          <div className="space-y-3">
            {rightFields.map((field, idx) => (
              <div
                key={field.key + "-" + idx}
                className="flex justify-between items-center"
              >
                <span className="font-semibold text-primary">
                  {field.label}
                </span>
                <div className="text-mid-gray font-bold">
                  {field.isStatus ? (
                    <ReservationStatusBadge
                      status={booking.status}
                      fallbackLabel={STATUS_MAP[booking.status] || booking.status}
                      className="rounded-md px-3 font-bold"
                    />
                  ) : (
                    booking[field.key]
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {filteredActions.map((action) => {
            const shouldBePrimaryForDetails =
              action.label === t("actions.showDetails") &&
              (isOnlyButton ||
                booking.status === "accepted" ||
                booking.status === "waiting_confirmation" ||
                (booking.status === "pending" && !hasOtherButton) ||
                (booking.status === "paid" && !hasOtherButton) ||
                (booking.status === "existing" && !hasOtherButton));

            let variant:
              | "default"
              | "destructive"
              | "outline"
              | "secondary"
              | "ghost"
              | "link" = "default";

            if (action.label === t("actions.cancel")) {
              variant = "outline";
            } else if (action.label === t("actions.renew")) {
              variant = "default";
            } else if (action.label === t("actions.confirmReservation")) {
              variant = "default";
            } else if (action.label === t("actions.showDetails")) {
              if (shouldBePrimaryForDetails) {
                variant = "default";
              } else {
                variant = "outline";
              }
            }

            const isCancel = action.label === t("actions.cancel");
            const isDetails = action.label === t("actions.showDetails");

            return (
              <Button
                key={action.label}
                variant={variant}
                size="sm"
                className={`flex-1 ${
                  isCancel
                    ? "border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                    : isDetails && !shouldBePrimaryForDetails
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : ""
                }`}
                onClick={
                  action.action === "details"
                    ? onShowDetails
                    : action.action === "cancel"
                    ? onCancel
                    : action.action === "renew"
                    ? onRenew
                    : action.action === "confirmReservation"
                    ? onConfirmReservation
                    : undefined
                }
                disabled={
                  (action.action === "cancel" && cancellingId === booking.id) ||
                  (action.action === "renew" && renewingId === booking.id)
                }
              >
                {(action.action === "cancel" && cancellingId === booking.id) ||
                (action.action === "renew" && renewingId === booking.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  action.label
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
