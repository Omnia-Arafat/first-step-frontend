"use client";

import { ReservationStatus } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { ReservationStatusBadge } from "@/components/shared/ReservationStatusBadge";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

import { AdminBooking } from "@/hooks/useAdminEnrollments";

export type Booking = AdminBooking;

export const getColumns = (
  selectedChildMap: Record<string, string>,
  setSelectedChildMap: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >
): ColumnDef<Booking>[] => [
  {
    accessorKey: "childNumber",
    header: () => (
      <div className="text-[.7rem] font-normal text-center min-w-[30px]">
        ---
      </div>
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "parent_name",
    header: () => <div className="min-w-[120px]">Parent Name</div>,
  },
  {
    accessorKey: "center",
    header: () => <div className="min-w-[150px]">المركز أو الحضانة</div>,
    cell: ({ row }) => {
      const center = row.getValue("center") as string;
      return <div className="text-right">{center || "غير محدد"}</div>;
    },
  },
  {
    accessorKey: "start_date",
    header: () => <div className="min-w-[100px]">تاريخ بدء الحجز</div>,
    cell: ({ row }) => {
      const date = row.getValue("start_date") as string;
      return <div className="text-center">{date || "غير محدد"}</div>;
    },
  },
  {
    accessorKey: "end_date",
    header: () => <div className="min-w-[100px]">تاريخ انتهاء الحجز</div>,
    cell: ({ row }) => {
      const date = row.getValue("end_date") as string;
      return <div className="text-center">{date || "غير محدد"}</div>;
    },
  },
  {
    accessorKey: "children",
    header: () => <div className="min-w-[120px]">Child</div>,
    cell: ({ row }) => {
      const rowId = row.original.id.toString();
      const children = row.original.children;

      const selectedValue =
        selectedChildMap[rowId] ?? children[0]?.id.toString() ?? "";

      return (
        <select
          className="text-xs px-2 py-1 rounded bg-info text-white"
          value={selectedValue}
          onChange={(e) =>
            setSelectedChildMap((prev) => ({
              ...prev,
              [rowId]: e.target.value,
            }))
          }
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      );
    },
  },
  {
    accessorKey: "branch",
    header: () => <div className="min-w-[120px]">الفرع</div>,
    cell: ({ row }) => {
      const branch = row.getValue("branch") as string;
      return <div className="text-right">{branch || "غير محدد"}</div>;
    },
  },
  {
    accessorKey: "price_amount",
    header: () => <div className="min-w-[80px]">المبلغ</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price_amount")) || 0;
      return (
        <div className="space-x-1 text-left">
          <span>{amount.toFixed(2)}</span>
          <span>ر.س</span>
        </div>
      );
    },
  },
  {
    id: "reservationStatus",
    header: () => <div className="min-w-[120px]">حالة الحجز</div>,
    cell: ({ row }) => {
      const status = row.original.status as ReservationStatus;
      return (
        <ReservationStatusBadge
          status={status || "waitingForConfirmation"}
          className="whitespace-nowrap"
        />
      );
    },
  },
];
