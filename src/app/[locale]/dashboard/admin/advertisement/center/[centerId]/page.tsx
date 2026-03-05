"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/dashboardApi";
import AdDetailsWrapper from "@/components/dashboard/advertisement/AdDetailsWrapper";
import { AdRequestFormData } from "@/lib/schemas";
import { Skeleton } from "@/components/ui/skeleton";

function CenterAdvertisementsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64 mx-auto" />
      <div className="flex flex-col gap-y-12">
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="flex flex-col gap-y-6 lg:px-5 xl:px-9">
              {Array.from({ length: 2 }).map((__, cardIndex) => (
                <div key={cardIndex} className="grid sm:grid-cols-2 items-start gap-4">
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CenterAdvertisementsPage({
  params,
}: {
  params: Promise<{ centerId: string }>;
}) {
  const meta = usePageMetadata();

  const { centerId } = use(params);
  const { data, isLoading, error } = useQuery({
    queryKey: ["centerAds", centerId],
    queryFn: () => adminService.getOneCenterAds(centerId),
  });

  const t = useTranslations("dashboard.admin.advertisement.center");

  if (isLoading) return <CenterAdvertisementsSkeleton />;
  if (error) return <div className="text-red-500">{t("errorLoading")}</div>;

  // Defensive: handle empty or missing ads
  const ads = data?.ads || [];

  // Helper to map backend ad to AdRequestFormData
  const mapAdToFormData = (ad: any): AdRequestFormData => ({
    title: {
      ar: ad.title.ar || "",
      en: ad.title.en || "",
    },
    description: {
      ar: ad.description.ar || "",
      en: ad.description.en || "",
    },
    image: ad.image,
    start_date: ad.publish_date ? new Date(ad.publish_date) : new Date(),
    end_date: ad.end_date ? new Date(ad.end_date) : new Date(),
  });

  return (
    <div className="space-y-4">
      <h1 className="heading-4 text-primary font-medium text-center">
        {t("pageTitle")}
      </h1>
      <div className="flex flex-col gap-y-12">
        <div className="space-y-4">
          <p className="heading-4 text-primary font-medium">
            {t("pendingAds")}
          </p>
          <div className="flex flex-col gap-y-6 lg:px-5 xl:px-9">
            {ads
              .filter((ad: any) => ad.status === "pending")
              .map((ad: any) => (
                <AdDetailsWrapper
                  key={ad.id}
                  adId={ad.id.toString()}
                  initialValues={mapAdToFormData(ad)}
                  mode="show"
                  adType="pending"
                />
              ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="heading-4 text-primary font-medium">
            {t("acceptedAds")}
          </p>
          <div className="flex flex-col gap-y-6 lg:px-5 xl:px-9">
            {ads
              .filter((ad: any) => ad.status === "approved")
              .map((ad: any) => (
                <AdDetailsWrapper
                  key={ad.id}
                  adId={ad.id.toString()}
                  initialValues={mapAdToFormData(ad)}
                  mode="show"
                  adType="accepted"
                />
              ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="heading-4 text-primary font-medium">
            {t("rejectedAds")}
          </p>
          <div className="flex flex-col gap-y-6 lg:px-5 xl:px-9">
            {ads
              .filter((ad: any) => ad.status === "rejected")
              .map((ad: any) => (
                <AdDetailsWrapper
                  key={ad.id}
                  adId={ad.id.toString()}
                  initialValues={mapAdToFormData(ad)}
                  mode="show"
                  adType="rejected"
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
