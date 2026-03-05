"use client";

import { useTranslations } from "next-intl";
import { PortfolioFormData } from "@/types";
import { SuccessStoriesSectionView } from "./SuccessStoriesSectionView";

interface Props {
  data: PortfolioFormData;
  onChange: (data: Partial<PortfolioFormData>) => void;
  errors?: Record<string, string[]>;
}

export const SuccessStoriesSection = ({
  data,
  onChange,
  errors = {},
}: Props) => {
  const t = useTranslations("dashboard.profileEditor.activities");
  const activities = data.images_activities || [];

  const handleAdd = () => {
    onChange({
      images_activities: [...activities, { image: "", kind: "", summary: "" }],
    });
  };

  const handleRemove = (index: number) => {
    const itemToRemove = activities[index];
    const newActivities = activities.filter((_, i) => i !== index);

    const updates: Partial<PortfolioFormData> = {
      images_activities: newActivities,
    };

    if (itemToRemove.id) {
      // In the current backend, we might be sending ID for deletion
      // But the previous implementation used original index?
      // Actually, since it's an object now, ID is better if it exists.
      // Based on common patterns in this codebase, we track IDs for deletion.
      updates.delete_images_activities = [
        ...(data.delete_images_activities || []),
        itemToRemove.id as number,
      ];
    }

    onChange(updates);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    onChange({ images_activities: newActivities });
  };

  return (
    <SuccessStoriesSectionView
      title={t("title")}
      description={t("description")}
      addLabel={t("addStory")}
      storyImageLabel={t("storyImage")}
      imageHint={t("imageHint")}
      caseTypeLabel={t("caseType")}
      caseTypePlaceholder={t("caseTypePlaceholder")}
      summaryLabel={t("improvementSummary")}
      summaryPlaceholder={t("improvementPlaceholder")}
      activities={activities}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onChange={handleChange}
    />
  );
};
