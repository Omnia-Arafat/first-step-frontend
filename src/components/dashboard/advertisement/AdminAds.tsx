"use client";

import { toastSuccess, toastError } from "@/lib/toast";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/dashboardApi";
import { Button } from "@/components/ui/button";
import AdRequestForm from "@/components/forms/dashboard/adblog-request/AdRequestForm";
import { AdRequestFormData } from "@/lib/schemas";
import EmptyState from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const AdminAds = () => {
  const queryClient = useQueryClient();

  const t = useTranslations("dashboard.admin.advertisement.adminAds");
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminAdvertisements"],
    queryFn: adminService.getAdvertisements,
  });

  const deleteMutation = useMutation({
    mutationFn: (adId: string) => adminService.deleteAdvertisement(adId),
    onSuccess: () => {
      toastSuccess(t("deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["adminAdvertisements"] });
    },
    onError: () => {
      toastError(t("deleteError"));
    },
  });

  // Add Advertisement button at the top
  const addButton = (
    <div className="mb-4 flex justify-end">
      <Button asChild size="sm">
        <Link href="/dashboard/admin/advertisement/add">{t("addNewAd")}</Link>
      </Button>
    </div>
  );

  if (error) return <div className="text-red-500">{t("errorLoading")}</div>;
  if (!data?.data?.length && !isLoading)
    return (
      <>
        {addButton}
        <EmptyState
          icon="📢"
          size="lg"
          primaryAction={{
            label: t("addNewAd"),
            onClick: () => {
              window.location.href = "/dashboard/admin/advertisement/add";
            },
          }}
          translationKey="dashboard.emptyStates.ads"
        />
      </>
    );

  const buttons = (
    formData: AdRequestFormData,
    isValid: boolean,
    adId: string,
  ) => (
    <>
      <Button asChild size={"sm"}>
        <Link href={`advertisement/${adId}/edit`}>{t("editAd")}</Link>
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          deleteMutation.mutate(adId);
        }}
        size={"sm"}
        variant={"outline"}
        className="border-destructive! text-destructive"
      >
        {t("deleteAd")}
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-y-6">
      {addButton}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 rounded-2xl border border-gray-100 p-6"
            >
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        data.data.map((item: any) => (
          <AdRequestForm
            key={item.id}
            initialData={{
              title: { ar: item.title.ar, en: item.title.en },
              description: { ar: item.description.ar, en: item.description.en },
              image: item.image,
              start_date: new Date(item.publish_date),
              end_date: new Date(item.end_date),
            }}
            mode="show"
          >
            {(formData, isValid) => buttons(formData, isValid, item.id)}
          </AdRequestForm>
        ))
      )}
    </div>
  );
};

export default AdminAds;
