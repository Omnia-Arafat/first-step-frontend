"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import {
  Report,
  useParentReportsColumns,
} from "@/components/tables/data/parent-reports";
import { DataTable } from "@/components/tables/DataTable";
import { parentService } from "@/services/dashboardApi";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "@/i18n/navigation";
import { toastSuccess, toastError } from "@/lib/toast";
import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import EmptyState from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyReportResponse {
  id: number;
  activities: string;
  meals: string;
  nap_time: string;
  behavior: string;
  notes: string;
  created_at: string;
  child: {
    id: number;
    name: string;
    gender: string;
    birthday: string;
    parent_name: string;
    mother_name: string;
    user: {
      id: number;
      name: string;
      email: string;
      address: string;
      phone: string;
    };
  };
  center: {
    id: number;
    name: string;
    location: string;
    phone: string;
    branch: {
      id: number;
      name: string;
    };
  };
  pdf_url: string;
}

const useDailyReports = () => {
  const meta = usePageMetadata();

  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const t = useTranslations("dashboard.parent.reports");

  const options: UseQueryOptions<Report[], Error> = {
    queryKey: ["dailyReports"],
    queryFn: async () => {
      const response = await parentService.getDailyReports();
      console.log("API Response:", response); // Debug log

      // Check if response has data property
      const reports = response.data || response;

      return reports.map((report: DailyReportResponse) => ({
        id: report.id,
        child: {
          id: report.child.id,
          name: report.child.name,
          gender: report.child.gender,
          birthday: report.child.birthday,
        },
        nurseryName: report.center.name,
        reportDate: new Date(report.created_at).toISOString().split("T")[0],
        pdf_url: report.pdf_url,
      }));
    },
    enabled: isAuthenticated(),
    retry: false,
  };

  const deleteMutation = useMutation({
    mutationFn: async (reportId: number) => {
      // TODO: Implement delete endpoint in parentService
      await parentService.deleteDailyReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyReports"] });
      toastSuccess(t("deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting report:", error);
      toastError(t("deleteError"));
    },
  });

  return {
    ...useQuery<Report[], Error>(options),
    deleteReport: deleteMutation.mutate,
  };
};

interface Child {
  id: number;
  name: string;
  gender: string;
  age: number;
  reportCount: number;
}

function ChildReportSkeleton() {
  return (
    <div className="flex flex-col items-center p-4 border border-gray-100 rounded-2xl bg-white">
      <Skeleton className="w-10 h-6 rounded mb-2" />
      <Skeleton className="w-[84px] h-[120px] rounded-xl mb-2" />
      <Skeleton className="w-16 h-6 rounded" />
    </div>
  );
}

export default function DailyReports() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations("dashboard.parent.reports");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const {
    data: reports = [],
    isLoading,
    error,
    deleteReport,
  } = useDailyReports();

  const columns = useParentReportsColumns({ onDelete: deleteReport });

  // Extract unique children from reports
  const children = useMemo(() => {
    const childrenMap = new Map<number, Child>();
    const reportCounts = new Map<number, number>();

    // First pass: count reports per child
    reports.forEach((report) => {
      const count = reportCounts.get(report.child.id) || 0;
      reportCounts.set(report.child.id, count + 1);
    });

    // Second pass: create child objects with report counts
    reports.forEach((report) => {
      if (!childrenMap.has(report.child.id)) {
        const birthDate = new Date(report.child.birthday);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        childrenMap.set(report.child.id, {
          id: report.child.id,
          name: report.child.name,
          gender: report.child.gender,
          age,
          reportCount: reportCounts.get(report.child.id) || 0,
        });
      }
    });
    return Array.from(childrenMap.values());
  }, [reports]);

  // Filter reports by selected child
  const filteredReports = useMemo(() => {
    if (!selectedChildId) return reports;
    return reports.filter((report) => report.child.id === selectedChildId);
  }, [reports, selectedChildId]);

  // Handle errors
  if (error) {
    console.error("Error fetching reports:", error);
    if ("status" in error && error.status === 403) {
      toastError(t("permissionError"));
    } else {
      toastError(error.message || t("error"));
    }
  }

  // Check authentication
  if (!isAuthenticated()) {
    console.log("User not authenticated, redirecting to sign-in");
    router.push("/sign-in");
    return null;
  }

  // If no children found but still loading
  if (isLoading && children.length === 0) {
    return (
      <div className="lg:p-4 space-y-6">
        <div className="flex flex-wrap gap-4 justify-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <ChildReportSkeleton key={index} />
          ))}
        </div>
        <Skeleton className="h-8 w-48 rounded mx-auto" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no children or no reports
  if (children.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon="📊"
        size="lg"
        translationKey="dashboard.emptyStates.reports"
      />
    );
  }

  return (
    <div className="lg:p-4 space-y-6">
      {children.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center">
          {children.map((child) => (
            <div
              key={child.id}
              className={`group flex flex-col items-center cursor-pointer p-4 border-2 rounded-2xl transition-all duration-300 ${
                selectedChildId === child.id
                  ? child.gender === "male"
                    ? "border-secondary-mint-green"
                    : "border-secondary-burgundy"
                  : "border-light-gray hover:border-gray-300"
              }`}
              onClick={() =>
                setSelectedChildId((prev) =>
                  prev === child.id ? null : child.id
                )
              }
            >
              <div
                className={`text-lg font-medium text-center mb-2 ${
                  selectedChildId === child.id
                    ? "text-primary"
                    : "text-mid-gray group-hover:text-primary"
                } transition-colors duration-300`}
              >
                {child.reportCount}
              </div>
              <div
                className={`relative transition-all duration-300 ${
                  selectedChildId === child.id
                    ? "saturate-100"
                    : "saturate-0 group-hover:saturate-50"
                }`}
              >
                <Image
                  src={`/assets/illustrations/${
                    child.gender === "male" ? "boy" : "girl"
                  }.png`}
                  alt={child.gender === "male" ? "Boy" : "Girl"}
                  width={child.gender === "male" ? 91.32 : 84.74}
                  height={120}
                  className="group-hover:scale-110 duration-300"
                />
              </div>
              <p
                className={`text-lg font-medium text-center mt-2 ${
                  selectedChildId === child.id
                    ? "text-primary"
                    : "text-mid-gray group-hover:text-primary"
                } transition-colors duration-300`}
              >
                {child.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="heading-4 text-primary text-center">{t("title")}</p>

      <DataTable
        columns={columns}
        data={filteredReports}
        isLoading={isLoading}
        pagination={true}
      />
    </div>
  );
}
