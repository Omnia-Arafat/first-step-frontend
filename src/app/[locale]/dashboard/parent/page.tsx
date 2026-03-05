"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby, Rocket, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parentService } from "@/services/dashboardApi";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import EmptyState from "@/components/common/EmptyState";
import { dashboardIcons } from "@/components/general/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function ParentDashboardHome() {
  usePageMetadata();
  const t = useTranslations("dashboard.parent.homePage");
  const router = useRouter();

  const { data: childrenCountData, isLoading: isChildrenCountLoading } =
    useQuery({
      queryKey: ["parent-children-count"],
      queryFn: parentService.getChildrenCount,
    });

  const { data: enrollmentsCountData, isLoading: isEnrollmentsCountLoading } =
    useQuery({
      queryKey: ["parent-enrollments-count"],
      queryFn: parentService.getEnrollmentsCount,
    });

  const {
    data: upcomingEnrollmentsData,
    isLoading: isUpcomingEnrollmentsLoading,
  } = useQuery({
    queryKey: ["parent-upcoming-enrollments"],
    queryFn: parentService.getUpcomingEnrollments,
  });

  const {
    data: currentEnrollmentsData,
    isLoading: isCurrentEnrollmentsLoading,
  } = useQuery({
    queryKey: ["parent-current-enrollments"],
    queryFn: parentService.getCurrentEnrollments,
  });

  // Parse data based on the provided structure
  const childrenCount = childrenCountData?.data?.children_count ?? 0;
  const enrollmentsCount =
    enrollmentsCountData?.data?.count_of_enrollments ?? 0;

  const upcomingEnrollments = [
    ...(Array.isArray(upcomingEnrollmentsData?.data)
      ? upcomingEnrollmentsData.data
      : []),
  ];

  const currentEnrollments = [
    ...(Array.isArray(currentEnrollmentsData?.data)
      ? currentEnrollmentsData.data
      : []),
  ];

  const getChildrenNames = (children: any[]) => {
    if (!children || children.length === 0) return "";
    return children.map((c) => c.child_name).join(", ");
  };

  const truncateText = (text: string, length: number = 30) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid gap-4 gap-y-10 md:grid-cols-2 lg:grid-cols-2">
          {/* Children Count Card */}
          <Card className="border-none shadow-[0_2px_80px_rgba(34,34,34,0.08)] flex flex-col items-center justify-center p-6">
            <dashboardIcons.files className="mb-4 h-12 w-12 text-secondary-mint-green" />
            {isChildrenCountLoading ? (
              <Skeleton className="h-10 w-16 rounded-md" />
            ) : (
              <div className="text-4xl font-bold text-secondary-mint-green">
                {childrenCount}
              </div>
            )}
            <div className="mt-2 text-xl font-bold text-primary">
              {t("childrenCount")}
            </div>
          </Card>

          {/* Enrollments Count Card */}
          <Card className="border-none shadow-[0_2px_80px_rgba(34,34,34,0.08)] flex flex-col items-center justify-center p-6">
            <dashboardIcons.bookings className="mb-4 h-12 w-12 text-secondary-mint-green" />
            {isEnrollmentsCountLoading ? (
              <Skeleton className="h-10 w-16 rounded-md" />
            ) : (
              <div className="text-4xl font-bold text-secondary-mint-green">
                {enrollmentsCount}
              </div>
            )}
            <div className="mt-2 text-xl font-bold text-primary">
              {t("enrollmentsCount")}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* Upcoming Enrollments */}
          <Card className="border-none shadow-[0_2px_80px_rgba(34,34,34,0.08)] col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">
                {t("upcomingEnrollments")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {isUpcomingEnrollmentsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : upcomingEnrollments.length > 0 ? (
                <>
                  <div className="space-y-4 flex-1">
                    {upcomingEnrollments.map((item: any) => {
                      const allNames = getChildrenNames(item.children);
                      const isTruncated = allNames.length > 30;

                      return (
                        <div
                          key={item.id}
                          className="border-b pb-4 last:border-0 last:pb-0"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-base font-medium text-mid-gray cursor-default">
                                {t("enrollmentStartsOn", {
                                  number: truncateText(allNames),
                                  date:
                                    item.starting_date || item.enrollment_date,
                                })}
                              </p>
                            </TooltipTrigger>
                            {isTruncated && (
                              <TooltipContent>
                                <p className="max-w-xs">{allNames}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 text-center">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full sm:w-auto gap-2 text-primary border-primary hover:bg-primary/5"
                    >
                      <Link href="/establishments">
                        {t("bookNow")} <Plus className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  translationKey="dashboard.parent.homePage.upcomingEnrollmentsEmpty"
                  icon={Rocket}
                  primaryAction={{
                    label: t("bookNow"),
                    onClick: () => router.push("/establishments"),
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Current Enrollments */}
          <Card className="border-none shadow-[0_2px_80px_rgba(34,34,34,0.08)] col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">
                {t("currentEnrollments")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {isCurrentEnrollmentsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : currentEnrollments.length > 0 ? (
                <>
                  <div className="space-y-4 flex-1">
                    {currentEnrollments.map((item: any) => {
                      const allNames = getChildrenNames(item.children);
                      const isTruncated = allNames.length > 30;

                      return (
                        <div
                          key={item.id}
                          className="border-b pb-4 last:border-0 last:pb-0"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-base font-medium text-primary-blue cursor-default">
                                {t("enrollmentEndsOn", {
                                  number: truncateText(allNames),
                                  date:
                                    item.ending_date || item.enrollment_date,
                                })}
                              </p>
                            </TooltipTrigger>
                            {isTruncated && (
                              <TooltipContent>
                                <p className="max-w-xs">{allNames}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 text-center">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full sm:w-auto gap-2 text-primary border-primary hover:bg-primary/5"
                    >
                      <Link href="/establishments">
                        {t("bookNow")} <Plus className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  translationKey="dashboard.parent.homePage.currentEnrollmentsEmpty"
                  icon={Baby}
                  primaryAction={{
                    label: t("bookNow"),
                    onClick: () => router.push("/establishments"),
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
