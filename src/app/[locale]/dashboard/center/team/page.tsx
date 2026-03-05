"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import Team from "@/components/dashboard/team/Team";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useQueries, UseQueryResult } from "@tanstack/react-query";
import { centerService } from "@/services/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";

export interface TeamMember {
  id: number;
  name: string;
  profession: string;
  image_url: string;
  branch_id: number;
  created_at: string;
  updated_at: string;
}

interface BranchTeamResponse {
  data: TeamMember[];
}

const BranchSkeleton = () => {
  return (
    <div className="mb-10">
      <div className="mb-3.5 flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-9 w-[100px] rounded-md" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-x-4 gap-y-5.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="p-2 rounded-3xl border border-gray-100 flex flex-col items-center gap-y-2"
          >
            <Skeleton className="w-full min-w-45 h-50 rounded-2xl" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CenterDashboardTeam() {
  const meta = usePageMetadata();

  const t = useTranslations("dashboard.center.team");

  const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: centerService.getBranches,
  });

  const branchQueries = useQueries({
    queries: branches.map((branch: any) => ({
      queryKey: ["branch-team", branch.id],
      queryFn: () => centerService.getBranchTeam(branch.id.toString()),
      enabled: !!branch.id,
    })),
  }) as UseQueryResult<BranchTeamResponse>[];

  const isLoading =
    isLoadingBranches || branchQueries.some((query) => query.isLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-10">
        <BranchSkeleton />
        <BranchSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-10">
      {branches.map((branch: any, index: number) => {
        const teamData = branchQueries[index]?.data?.data || [];
        return (
          <div key={branch.id}>
            <div className="mb-3.5 flex items-center justify-between">
              <h1 className="heading-4 font-medium text-primary">
                {branch.name}
              </h1>

              <Button asChild size={"sm"} variant={"outline"}>
                <Link href={`team/add?branch_id=${branch.id}`}>
                  {t("add.button")}
                </Link>
              </Button>
            </div>

            <Team members={teamData} branchId={branch.id} />
          </div>
        );
      })}
    </div>
  );
}
