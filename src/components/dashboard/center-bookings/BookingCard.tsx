"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Booking } from "@/components/tables/data/center-bookings";
import { ReservationStatusBadge } from "@/components/shared/ReservationStatusBadge";
import { useAuthUser } from "@/store/authStore";

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onAccept?: (
    enrollmentId: string,
    enrollmentType: string,
    currentStatus: string
  ) => void;
  onReject?: (enrollmentId: string, currentStatus: string) => void;
  onSendNotification?: (enrollmentId: number) => void;
  isNotificationLoading?: boolean;
}

export const BookingCard = ({
  booking,
  onViewDetails,
  onAccept,
  onReject,
  onSendNotification,
  isNotificationLoading,
}: BookingCardProps) => {
  const t = useTranslations("dashboard.tables.center-bookings");
  const tBookings = useTranslations("dashboard.center-bookings");

  const user = useAuthUser();

  const firstChild = booking.childs[0];
  const status = firstChild?.status || "-";

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      hour: tBookings("programTypes.hourly"),
      day: tBookings("programTypes.daily"),
      week: tBookings("programTypes.weekly"),
      month: tBookings("programTypes.monthly"),
      year: tBookings("programTypes.yearly"),
    };
    return typeMap[type] || type;
  };

  // Format children names
  const formatChildrenNames = () => {
    const uniqueChildren = Array.from(
      new Map(booking.childs.map((child) => [child.id, child.name])).values()
    );

    if (uniqueChildren.length === 0) return "-";
    if (uniqueChildren.length === 1) return uniqueChildren[0];
    if (uniqueChildren.length === 2)
      return `${uniqueChildren[0]}, ${uniqueChildren[1]}`;

    const remaining = uniqueChildren.length - 2;
    return `${uniqueChildren[0]}, ${uniqueChildren[1]} ${tBookings(
      "andOthers",
      { count: remaining.toString() }
    )}`;
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

  const isHourly = booking.type === "hour";

  return (
    <Card
      id={`enrollment-${booking.id}`}
      className="p-6 hover:shadow-lg transition-all border border-gray-200"
    >
      <div className="space-y-4">
        {/* Details Grid - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3 text-sm">
          {/* Right Column */}
          <div className="text-right space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-mid-gray">{formatChildrenNames()}</span>
              <span className="font-semibold text-primary">
                {tBookings("fields.childrenLabel")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mid-gray">{user?.nursery_name}</span>
              <span className="font-semibold text-primary">
                {tBookings("fields.nursery")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mid-gray">{booking.branch}</span>
              <span className="font-semibold text-primary">
                {tBookings("fields.branch")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mid-gray">
                {getTypeLabel(booking.type)}
              </span>
              <span className="font-semibold text-primary">
                {tBookings("fields.program")}
              </span>
            </div>
          </div>

          {/* Left Column */}
          <div className="text-right space-y-3">
            <div className="flex justify-between items-center">
              <ReservationStatusBadge
                status={status}
                className="rounded-md px-3"
              />
              <span className="font-semibold text-primary">
                {tBookings("fields.bookingStatus")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mid-gray">{booking.startDate}</span>
              <span className="font-semibold text-primary">
                {isHourly ? tSummary("date") : tBookings("fields.startDay")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mid-gray">{booking.endDate || "-"}</span>
              <span className="font-semibold text-primary">
                {isHourly ? tSummary("time") : tBookings("fields.endDay")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mid-gray">{booking.count || "-"}</span>
              <span className="font-semibold text-primary">
                {getCountLabel(booking.type)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* expired: View Details + Send notification */}
          {status === "expired" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => onViewDetails(booking)}
              >
                {tBookings("viewDetailsButton")}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onSendNotification?.(booking.id)}
                disabled={isNotificationLoading}
              >
                {isNotificationLoading
                  ? tBookings("sendingNotification")
                  : tBookings("sendNotification")}
              </Button>
            </>
          )}

          {/* paid, cancelled, rejected: View Details only */}
          {(status === "paid" ||
            status === "cancelled" ||
            status === "rejected") && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => onViewDetails(booking)}
            >
              {tBookings("viewDetailsButton")}
            </Button>
          )}

          {/* existing (من خلال المركز): Confirm or Reject */}
          {status === "existing" && firstChild && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => onReject?.(firstChild.enrollmentId, status)}
              >
                {tBookings("rejectBooking")}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() =>
                  onAccept?.(firstChild.enrollmentId, booking.type, status)
                }
              >
                {tBookings("confirmBooking")}
              </Button>
            </>
          )}

          {/* accepted (waiting for payment): View Details or Cancel */}
          {status === "accepted" && firstChild && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => onReject?.(firstChild.enrollmentId, status)}
              >
                {tBookings("cancelBooking")}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onViewDetails(booking)}
              >
                {tBookings("viewDetailsButton")}
              </Button>
            </>
          )}

          {/* pending (waiting for confirmation): Accept or Reject */}
          {status === "pending" && firstChild && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => onReject?.(firstChild.enrollmentId, status)}
              >
                {tBookings("rejectBooking")}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() =>
                  onAccept?.(firstChild.enrollmentId, booking.type, status)
                }
              >
                {tBookings("acceptBooking")}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
