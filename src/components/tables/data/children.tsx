"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ReservationStatusBadge } from "@/components/shared/ReservationStatusBadge";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Child = {
  id: number | string; // Allow both number and string IDs
  child_name: string;
  birthday_date: string;
  parent_name: string;
  branch_name: string;
  enrollments: Array<{
    status: string;
  }>;
};

export function useChildrenColumns() {
  const t = useTranslations("dashboard.tables.children");

  const columns: ColumnDef<Child>[] = [
    {
      accessorKey: "childNumber",
      header: () => (
        <div className="text-[.7rem] font-normal text-center">
          {t("headers.childNumber")}
        </div>
      ),
      cell: ({ row }) => {
        return <div className="text-center">{row.index + 1}</div>;
      },
    },
    {
      accessorKey: "child_name",
      header: () => t("headers.childName"),
    },
    {
      accessorKey: "birthday_date",
      header: () => t("headers.dateOfBirth"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("birthday_date"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "parent_name",
      header: () => t("headers.parentName"),
    },
    {
      accessorKey: "branch_name",
      header: () => t("headers.branch"),
    },
    {
      accessorKey: "enrollments",
      header: () => t("headers.reservationStatus"),
      cell: ({ row }) => {
        const enrollments = row.getValue("enrollments") as Child["enrollments"];
        const latestEnrollment = enrollments[0];
        const status = latestEnrollment?.status || "pending";
        return <ReservationStatusBadge status={status} />;
      },
    },
    {
      accessorKey: "control",
      header: () => t("headers.control"),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            <Button asChild variant={"ghost"} size={"icon"}>
              <Link href={`children-files/${row.original.id}`}>
                <Eye className="size-4 text-mid-gray" />
              </Link>
            </Button>
            {/* <Button asChild variant={"ghost"} size={"icon"}>
              <Link href={`children-files/${row.original.id}/edit`}>
                <Edit className="size-4 text-mid-gray" />
              </Link>
            </Button>
            <Button variant={"ghost"} size={"icon"}>
              <Trash2 className="size-4 text-mid-gray" />
            </Button> */}
          </div>
        );
      },
    },
  ];

  return columns;
}
