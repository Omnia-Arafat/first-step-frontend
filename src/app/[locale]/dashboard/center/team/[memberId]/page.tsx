"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import MemberFormWrapper from "@/components/forms/dashboard/team/MemberFormWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { centerService } from "@/services/dashboardApi";

export default function EditTeamMember({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const meta = usePageMetadata();

  const t = useTranslations("dashboard.center.team");
  const { memberId } = use(params);

  const { data: member, isLoading } = useQuery({
    queryKey: ["branch-team-member", memberId],
    queryFn: () => centerService.getBranchTeamMember(memberId),
  });

  if (isLoading) {
    return (
      <div className="p-10 flex flex-col gap-y-6">
        <Skeleton className="h-8 w-[200px] mx-auto" />
        <div className="grid sm:grid-cols-2 items-start gap-4 gap-y-6">
          <div className="flex flex-col gap-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[240px] w-[240px] rounded-xl" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 flex flex-col gap-y-6">
      <p className="heading-4 font-medium text-primary text-center">
        {t("edit.title")}
      </p>

      <MemberFormWrapper
        memberId={memberId}
        initialData={{
          name: member.data.name,
          branch: member.data.branch_id.toString(),
          job: member.data.profession,
          image: member.data.image_url,
        }}
        mode="edit"
      />
    </div>
  );
}
