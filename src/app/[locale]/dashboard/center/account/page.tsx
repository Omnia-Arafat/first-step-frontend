"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { useLocale, useTranslations } from "next-intl";
import { useAuthStore, useAuthUser } from "@/store/authStore";
import { centerService } from "@/services/dashboardApi";
import EditProfile from "@/components/dashboard/EditProfile";
import { CenterProfileForm, createCenterProfileSchema } from "@/lib/schemas";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function CenterEditProfilePage() {
  const meta = usePageMetadata();

  const t = useTranslations("dashboard.account");
  const locale = useLocale();
  const user = useAuthUser();
  const queryClient = useQueryClient();

  const centerSchema = createCenterProfileSchema(locale as "ar" | "en");

  // ✅ Fetch center data with React Query
  const { data: centerData, isLoading } = useQuery({
    queryKey: ["centerData"],
    queryFn: () => centerService.getCenterData(),
    enabled: !!user, // only run when user is available
  });

  // ✅ Update profile with mutation
  const updateProfileMutation = useMutation({
    mutationFn: (payload: any) => centerService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["centerData"] });

      useAuthStore.getState().updateUser({
        name: updatedUser.center.nurcery_name,
        email: updatedUser.center.email,
        address: updatedUser.center.adderss,
        nurcery_name: updatedUser.center.nurcery_name,
      });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });

  const centerProfileFields = [
    {
      key: "nursery_name",
      label: t("fields.nurseryName"),
      type: "text",
      placeholder: t("placeholders.nurseryName"),
      required: true,
    },
    {
      key: "email",
      label: t("fields.email"),
      type: "email",
      placeholder: t("placeholders.email"),
      required: true,
    },
    {
      key: "phone",
      label: t("fields.phone"),
      type: "tel",
      placeholder: t("placeholders.phone"),
      required: true,
    },
    {
      key: "address",
      label: t("fields.address"),
      type: "text",
      placeholder: t("placeholders.address"),
      required: true,
    },
    {
      key: "location",
      label: t("fields.location"),
      type: "text",
      placeholder: t("placeholders.location"),
      required: true,
    },
    {
      key: "neighborhood",
      label: t("fields.neighborhood"),
      type: "text",
      placeholder: t("placeholders.neighborhood"),
      required: true,
    },
    {
      key: "city_id",
      label: t("fields.city"),
      type: "text",
      placeholder: t("placeholders.city"),
      required: true,
    },
  ];

  const handleSave = async (formData: CenterProfileForm) => {
    const payload: any = {
      ...formData,
    };

    if (formData.city_id) {
      payload.city_id = Number(formData.city_id);
    }

    await updateProfileMutation.mutateAsync(payload);
  };

  if (!user || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <EditProfile
        title={t("titles.editCenterAccount")}
        fields={centerProfileFields}
        onSave={handleSave}
        initialData={centerData.data}
        schema={centerSchema}
      />
    </div>
  );
}
