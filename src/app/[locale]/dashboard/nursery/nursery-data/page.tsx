"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { centerService } from "@/services/dashboardApi";
import { PortfolioFormData } from "@/types";
import { toastSuccess, toastError } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { useAuthUser } from "@/store/authStore";

// Section Components
import { BasicInfoSection } from "./_components/BasicInfoSection";
import { ServicesSection } from "./_components/ServicesSection";
import { PlansSection } from "./_components/PlansSection";
import { FacilitiesSection } from "./_components/FacilitiesSection";
import { ActivitiesSection } from "./_components/ActivitiesSection";
import { LicensesSection } from "./_components/LicensesSection";
import { SocialMediaSection } from "./_components/SocialMediaSection";

export default function CenterProfilePage() {
  usePageMetadata();
  const t = useTranslations("dashboard.profileEditor");
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthUser();
  const [activeSection, setActiveSection] = useState<string>("basicInfo");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const [portfolioId, setPortfolioId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
    title_of_hero: "",
    subtitle_of_hero: "",
    description: "",
    images_activities: [],
    delete_images_activities: [],
    services: [],
    delete_service_ids: [],
    admin_option_ids: [],
    licenses: [],
    delete_license_ids: [],
    contact_info: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedIn: "",
      website: "",
    },
  });

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [dirtyFields, setDirtyFields] = useState<Set<keyof PortfolioFormData>>(
    new Set(),
  );

  // Fetch initial data
  const { data: initialData, isLoading } = useQuery({
    queryKey: ["centerPortfolio"],
    queryFn: () => centerService.getPortfolio(),
  });

  useEffect(() => {
    const p = initialData?.portofilo || initialData?.data;
    if (p) {
      const normalizedActivities = (p.images_activities || []).map(
        (item: any, index: number) =>
          typeof item === "string"
            ? { image: item, server_index: index }
            : {
                ...item,
                server_index:
                  typeof item.server_index === "number"
                    ? item.server_index
                    : index,
              },
      );

      setFormData({
        title_of_hero: p.hero_section?.title_of_hero || p.title_of_hero || "",
        subtitle_of_hero:
          p.hero_section?.subtitle_of_hero || p.subtitle_of_hero || "",
        description: p.hero_section?.description || p.description || "",
        contact_info: {
          facebook: p.contact_info?.facebook || p.facebook || "",
          instagram: p.contact_info?.instagram || p.instagram || "",
          twitter: p.contact_info?.twitter || p.twitter || "",
          linkedIn: p.contact_info?.linkedIn || p.linkedin || "",
          website: p.contact_info?.website || p.website || "",
        },
        images_activities: normalizedActivities,
        delete_images_activities: [],
        services: p.services || [],
        delete_service_ids: [],
        admin_option_ids:
          (p.admin_options || p.options)?.map((o: any) => o.id) || [],
        licenses: p.licenses || [],
      });
      // The logo might be in the parent object, inside portfolio, or the user object
      setLogoUrl(p.logo || initialData?.logo || user?.logo || "");
      setPortfolioId(p.id || null);
      setIsDirty(false);
      setDirtyFields(new Set());
    }
  }, [initialData, user?.logo]);

  const updateFormData = (newData: Partial<PortfolioFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    setIsDirty(true);

    const keys = Object.keys(newData) as (keyof PortfolioFormData)[];
    setDirtyFields((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => next.add(key));
      return next;
    });

    // Clear errors for updated fields
    if (Object.keys(validationErrors).length > 0) {
      const updatedFields = Object.keys(newData);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        updatedFields.forEach((field) => {
          // Clear flat key
          delete newErrors[field];
          // Clear nested keys (e.g., contact_info.facebook)
          Object.keys(newErrors).forEach((key) => {
            if (key.startsWith(`${field}.`)) {
              delete newErrors[key];
            }
          });
        });
        return newErrors;
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: ({
      data,
      id,
    }: {
      data: PortfolioFormData;
      id?: number | string;
    }) => centerService.savePortfolio(data, id),
    onSuccess: () => {
      setValidationErrors({});
      queryClient.invalidateQueries({ queryKey: ["centerPortfolio"] });
      toastSuccess(t("title"), t("saveSuccess"));
      router.refresh();
    },
    onError: (error: any) => {
      if (error.errors && typeof error.errors === "object") {
        setValidationErrors(error.errors);

        // Extract first actual error message if available
        const firstErrorKey = Object.keys(error.errors)[0];
        const firstErrorMessage = error.errors[firstErrorKey]?.[0];

        toastError(
          t("title"),
          firstErrorMessage || error.message || t("saveError"),
        );
      } else {
        toastError(t("title"), error.message || t("saveError"));
      }
    },
  });

  const logoMutation = useMutation({
    mutationFn: (file: File) => centerService.updateLogo(file),
    onSuccess: (response) => {
      toastSuccess(t("title"), t("saveSuccess"));
      if (response.data?.logo) {
        setLogoUrl(response.data.logo);
      }
    },
    onError: (error: any) => {
      toastError(t("title"), error.message || t("saveError"));
    },
  });

  const handleSave = () => {
    // Validate licenses - stop sending if any entry is incomplete
    if (formData.licenses && formData.licenses.length > 0) {
      const isIncomplete = formData.licenses.some(
        (l) => !l.number?.trim() || !l.document,
      );

      if (isIncomplete) {
        toastError(
          t("sections.licenses"),
          "Please complete all license information (number and document) before saving.",
        );
        return; // BLOCK SUBMISSION
      }
    }

    const dirtyData: Partial<PortfolioFormData> = {};
    dirtyFields.forEach((field) => {
      (dirtyData as any)[field] = (formData as any)[field];
    });

    // Always include deletion trackers if they have items
    if (formData.delete_license_ids?.length) {
      dirtyData.delete_license_ids = formData.delete_license_ids;
    }
    if (formData.delete_images_activities?.length) {
      dirtyData.delete_images_activities = formData.delete_images_activities;
    }
    if (formData.delete_service_ids?.length) {
      dirtyData.delete_service_ids = formData.delete_service_ids;
    }

    // If nothing dirty left after filtering, don't send
    if (
      Object.keys(dirtyData).length === 0 &&
      !formData.delete_license_ids?.length &&
      !formData.delete_images_activities?.length &&
      !formData.delete_service_ids?.length
    ) {
      setIsDirty(false);
      return;
    }

    saveMutation.mutate({
      data: dirtyData as PortfolioFormData,
      id: portfolioId || undefined,
    });
  };

  const handleCancel = () => {
    router.back();
  };

  const sections = [
    {
      id: "basicInfo",
      title: t("sections.basicInfo"),
    },
    {
      id: "services",
      title: t("sections.services"),
    },
    {
      id: "plans",
      title: t("sections.plans"),
    },
    {
      id: "facilities",
      title: t("sections.facilities"),
    },
    {
      id: "activities",
      title: t("sections.nurseryActivities"),
    },
    {
      id: "licenses",
      title: t("sections.licenses"),
    },
    {
      id: "socialMedia",
      title: t("sections.socialMedia"),
    },
  ];

  const renderSection = (id: string) => {
    switch (id) {
      case "basicInfo":
        return (
          <BasicInfoSection
            data={formData}
            onChange={updateFormData}
            errors={validationErrors}
            logoUrl={logoUrl}
            onLogoChange={(file: File) => logoMutation.mutate(file)}
          />
        );
      case "services":
        return (
          <ServicesSection
            data={formData}
            onChange={updateFormData}
            errors={validationErrors}
          />
        );
      case "plans":
        return <PlansSection />;
      case "facilities":
        return (
          <FacilitiesSection
            data={formData}
            onChange={updateFormData}
            errors={validationErrors}
          />
        );
      case "activities":
        return (
          <ActivitiesSection
            data={formData}
            onChange={updateFormData}
            errors={validationErrors}
          />
        );
      case "licenses":
        return (
          <LicensesSection
            data={formData}
            onChange={updateFormData}
            errors={validationErrors}
          />
        );
      case "socialMedia":
        return (
          <SocialMediaSection
            data={formData}
            onChange={updateFormData}
            errors={validationErrors}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-6 flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold text-primary">
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <Accordion
            type="single"
            collapsible
            value={activeSection}
            onValueChange={setActiveSection}
            className="space-y-4"
          >
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border rounded-2xl bg-white overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-4 lg:px-6 py-3 lg:py-4 hover:no-underline hover:bg-gray-50 transition-colors data-[state=open]:border-b">
                  <span className="text-lg sm:text-xl font-bold text-primary">
                    {section.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-4 lg:p-8">
                  {renderSection(section.id)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              size="lg"
              className="w-full flex-1"
              onClick={handleSave}
              disabled={saveMutation.isPending || !isDirty}
            >
              {saveMutation.isPending ? t("saving") : t("savePortfolio")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full flex-1"
              onClick={handleCancel}
            >
              {t("cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
