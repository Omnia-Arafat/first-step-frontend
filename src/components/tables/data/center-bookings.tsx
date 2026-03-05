"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { ReservationStatus } from "./shared/status";
import { ReservationStatusBadge } from "@/components/shared/ReservationStatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";
import { centerService } from "@/services/dashboardApi";
import { toastSuccess, toastError } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Booking = {
  id: number;
  parentName: string;
  branchId?: number;
  branchPriceId?: number;
  childs: {
    id: string;
    name: string;
    enrollmentId: string;
    status: string;
    branch: string;
    branchId?: number;
    startDate: string;
    type: string;
    amount: number;
    age: number;
  }[];
  branch: string;
  startDate: string;
  endDate?: string;
  type: string;
  amount: number;
  isDetail?: boolean;
  isExpandedParent?: boolean;
  detailChildName?: string;
  detailEnrollmentId?: string;
  detailStatus?: string;
  count: number;
  dayString?: string;
  startingTime?: string;
  endingTime?: string;
  reservation?: CouponReservation;
  pricing?: PricingDetails;
};

export type CouponReservation = {
  id: number;
  enrollment_id: number;
  user_id: number;
  promocode_title: string;
  expire_at: string;
  created_at: string;
  updated_at: string;
};

export type PricingDetails = {
  original_amount: number;
  discount: number;
  final_amount: number;
  discount_type: string;
};

export interface SelectedChild {
  enrollmentId: string;
  status: string;
  branch: string;
  startDate: string;
  type: string;
  amount: number;
}

export function useCenterBookingsColumns(
  selectedChildMap: Record<number, SelectedChild>,
  setSelectedChildMap: React.Dispatch<
    React.SetStateAction<Record<number, SelectedChild>>
  >,
  onViewDetails?: (booking: Booking) => void
) {
  const t = useTranslations("dashboard.tables.center-bookings");
  const queryClient = useQueryClient();

  const enrollmentMutation = useMutation({
    mutationFn: async ({
      enrollmentId,
      status,
    }: {
      enrollmentId: string;
      status: string;
    }) => {
      await centerService.respondEnrollment(parseInt(enrollmentId), status);
    },
    onSuccess: () => {
      toastSuccess(t("enrollmentResponseSuccess"));
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["centerBookings"] });
    },
    onError: () => {
      toastError(t("enrollmentResponseError"));
    },
  });

  const handleEnrollmentResponse = async (
    enrollmentId: string,
    status: string
  ) => {
    enrollmentMutation.mutate({ enrollmentId, status });
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "childNumber",
      header: () => (
        <div className="text-[.7rem] font-normal text-center">
          {t("headers.childNumber")}
        </div>
      ),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        return isDetail ? (
          <div className="text-center">•</div>
        ) : (
          <div className="text-center">{row.index + 1}</div>
        );
      },
    },
    {
      accessorKey: "parentName",
      header: () => t("headers.parentName"),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        const isExpandedParent = (row.original as any).isExpandedParent;
        if (!isDetail && isExpandedParent) return "";

        return row.original.parentName;
      },
    },
    {
      accessorKey: "startDate",
      header: () => t("headers.startDate"),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        if (isDetail) return row.original.startDate;
        const parentId = row.original.id;
        const selectedChild = selectedChildMap[parentId];
        const isExpandedParent = (row.original as any).isExpandedParent;
        if (isExpandedParent) return "";
        return selectedChild?.startDate ?? row.original.startDate;
      },
    },
    {
      accessorKey: "type",
      header: () => t("headers.type"),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        if (isDetail) return row.original.type;

        const isExpandedParent = (row.original as any).isExpandedParent;
        if (isExpandedParent) return "";

        const parentId = row.original.id;
        const selectedChild = selectedChildMap[parentId];
        return selectedChild?.type ?? row.original.type;
      },
    },
    {
      accessorKey: "childs",
      header: () => t("headers.child"),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        if (isDetail) return row.original.detailChildName; // show child name in detail row's child column

        const parentId = row.original.id;
        const childs = row.original.childs;

        // Group flattened enrollments by child id
        const childIdToGroup = new Map<
          string,
          { name: string; enrollments: typeof childs }
        >();
        for (const entry of childs) {
          const group = childIdToGroup.get(entry.id) ?? {
            name: entry.name,
            enrollments: [] as typeof childs,
          };
          (group.enrollments as any).push(entry);
          childIdToGroup.set(entry.id, group);
        }
        const uniqueChildren = Array.from(childIdToGroup.entries()).map(
          ([childId, group]) => ({
            childId,
            name: group.name,
            enrollments: group.enrollments,
          })
        );

        const selectedChild = selectedChildMap[parentId] ?? {
          enrollmentId: childs[0]?.enrollmentId ?? "",
          status: childs[0]?.status ?? "",
          branch: childs[0]?.branch ?? "",
          startDate: childs[0]?.startDate ?? "",
          type: childs[0]?.type ?? "",
          amount: childs[0]?.amount ?? 0,
        };

        // Figure out which child is currently selected based on current enrollmentId
        const selectedEnrollment = childs.find(
          (c) => c.enrollmentId === selectedChild.enrollmentId
        );
        const selectedChildId = selectedEnrollment
          ? selectedEnrollment.id
          : uniqueChildren[0]?.childId;

        return (
          <select
            className="text-xs px-2 py-1 rounded bg-info text-white"
            value={selectedChildId}
            onChange={(e) => {
              const childId = e.target.value;
              const group = childIdToGroup.get(childId);
              const firstEnrollment = group?.enrollments?.[0];
              if (firstEnrollment) {
                setSelectedChildMap((prev) => ({
                  ...prev,
                  [parentId]: {
                    enrollmentId: firstEnrollment.enrollmentId,
                    status: firstEnrollment.status as ReservationStatus,
                    branch: firstEnrollment.branch,
                    startDate: firstEnrollment.startDate,
                    type: firstEnrollment.type,
                    amount: firstEnrollment.amount,
                  },
                }));
              }
            }}
          >
            {uniqueChildren.map((child) => (
              <option key={child.childId} value={child.childId}>
                {child.name}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      accessorKey: "branch",
      header: () => t("headers.branch"),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        if (isDetail) return row.original.branch;
        const parentId = row.original.id;
        const selectedChild = selectedChildMap[parentId];
        const isExpandedParent = (row.original as any).isExpandedParent;
        if (isExpandedParent) return "";
        return selectedChild?.branch ?? row.original.branch;
      },
    },
    {
      accessorKey: "amount",
      header: () => t("headers.amount"),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        const parentId = row.original.id;
        const selectedChild = selectedChildMap[parentId];
        const isExpandedParent = (row.original as any).isExpandedParent;
        const amount = isDetail
          ? row.original.amount
          : selectedChild?.amount ?? row.original.amount;
        if (!isDetail && isExpandedParent) return "";
        return (
          <div className="space-x-1 rtl:space-x-reverse">
            <span>{amount}</span>
            <span>{t("currency")}</span>
          </div>
        );
      },
    },
    {
      id: "reservationStatus",
      header: () => t("headers.reservationStatus"),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        const parentId = row.original.id;
        const childs = row.original.childs;
        const selectedChild = selectedChildMap[parentId] ?? {
          status: childs[0]?.status ?? "",
        };

        const effectiveStatus = isDetail
          ? ((row.original as any).detailStatus as string)
          : selectedChild.status;
        const status = effectiveStatus as ReservationStatus;

        const isExpandedParent = (row.original as any).isExpandedParent;
        if (!isDetail && isExpandedParent) return "";

        return <ReservationStatusBadge status={status} />;
      },
    },
    {
      id: "control",
      header: () => t("headers.control"),
      cell: ({ row }) => {
        const isDetail = (row.original as any).isDetail;
        const parentId = row.original.id;
        const childs = row.original.childs;
        const selectedChild = selectedChildMap[parentId] ?? {
          status: childs[0]?.status ?? "",
          enrollmentId: childs[0]?.enrollmentId,
        };
        const effectiveStatus = isDetail
          ? ((row.original as any).detailStatus as string)
          : selectedChild.status;
        const effectiveEnrollmentId = isDetail
          ? ((row.original as any).detailEnrollmentId as string)
          : selectedChild.enrollmentId;
        const isWaitingForConfirmation = effectiveStatus === "pending";

        const isExpandedParent = (row.original as any).isExpandedParent;
        if (!isDetail && isExpandedParent) return "";

        return (
          <div className="flex items-center gap-2">
            {/* View Details Button - Always visible */}
            {onViewDetails && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => onViewDetails(row.original)}
                title={t("view") || "View"}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}

            {/* Accept/Reject Buttons - Only for pending status */}
            {isWaitingForConfirmation && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 h-fit text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    handleEnrollmentResponse(effectiveEnrollmentId, "accepted")
                  }
                  disabled={enrollmentMutation.isPending}
                >
                  <Check className="w-4 h-4" />
                  {enrollmentMutation.isPending ? t("processing") : t("accept")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 h-fit text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    handleEnrollmentResponse(effectiveEnrollmentId, "rejected")
                  }
                  disabled={enrollmentMutation.isPending}
                >
                  <X className="w-4 h-4" />
                  {enrollmentMutation.isPending ? t("processing") : t("reject")}
                </Button>
              </>
            )}
          </div>
        );
      },
      enableHiding: true,
      meta: {
        isWaitingForConfirmation: (row: any) => {
          const parentId = row.original.id;
          const selectedChild = selectedChildMap[parentId];
          return selectedChild?.status === "waitingForConfirmation";
        },
      },
    },
  ];

  return columns;
}
