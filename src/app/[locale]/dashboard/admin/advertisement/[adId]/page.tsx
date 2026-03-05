"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import AdDetailsWrapper from "@/components/dashboard/advertisement/AdDetailsWrapper";
import { AdRequestFormData } from "@/lib/schemas";
import { adminService } from "@/services/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";

function AdvertisementDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid sm:grid-cols-2 items-start gap-4">
        <div className="sm:col-span-2 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="aspect-[720/340] w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="sm:col-span-2 flex gap-3 justify-end">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function AdvertisementDetails({
  params,
}: {
  params: Promise<{ adId: string }>;
}) {
  const meta = usePageMetadata();

  const { adId } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["advertisement", adId],
    queryFn: () => adminService.getAdvertisement(adId),
    enabled: !!adId,
  });

  const t = useTranslations("dashboard.admin.advertisement.details");

  if (isLoading) return <AdvertisementDetailsSkeleton />;
  if (error) return <div className="text-red-500">{t("errorLoading")}</div>;
  if (!data) return null;

  // Map API response to AdRequestFormData
  const initialValues: AdRequestFormData = {
    title: data.title,
    description: data.description,
    image: data.image,
    start_date: data.publish_date,
    end_date: data.end_date,
  };

  return (
    <div>
      <AdDetailsWrapper adId={adId} initialValues={initialValues} mode="show" />
    </div>
  );
}
