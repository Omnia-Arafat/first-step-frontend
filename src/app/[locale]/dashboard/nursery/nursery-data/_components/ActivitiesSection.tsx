"use client";

import { useTranslations } from "next-intl";
import { PortfolioFormData } from "@/types";
import { toastError } from "@/lib/toast";
import { PhotoAlbumSectionView } from "./PhotoAlbumSectionView";

// The shape of a single activity item in PortfolioFormData
type ActivityItem = NonNullable<PortfolioFormData["images_activities"]>[number];

interface Props {
  data: PortfolioFormData;
  onChange: (data: Partial<PortfolioFormData>) => void;
  errors?: Record<string, string[]>;
}

export const ActivitiesSection = ({ data, onChange, errors = {} }: Props) => {
  const t = useTranslations("dashboard.profileEditor.activities");

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    const newItems: ActivityItem[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_SIZE) {
        toastError(t("uploadTitle"), `${file.name}: ${t("formatsNote")}`);
      } else if (!file.type.startsWith("image/")) {
        toastError(t("uploadTitle"), `${file.name}: Only images are allowed`);
      } else {
        // Wrap the File inside the object shape expected by PortfolioFormData
        newItems.push({ image: file });
      }
    });

    if (newItems.length === 0) return;

    onChange({
      images_activities: [...(data.images_activities || []), ...newItems],
    });
  };

  const handleRemove = (index: number) => {
    const images = data.images_activities || [];
    const itemToRemove = images[index];

    const updatedImages = images.filter((_, i) => i !== index);
    const updates: Partial<PortfolioFormData> = {
      images_activities: updatedImages,
    };

    const deleteKey =
      typeof itemToRemove.server_index === "number"
        ? itemToRemove.server_index
        : typeof itemToRemove.id === "number"
          ? itemToRemove.id
          : null;

    if (deleteKey !== null) {
      updates.delete_images_activities = [
        ...new Set([...(data.delete_images_activities || []), deleteKey]),
      ];
    }

    onChange(updates);
  };
  return (
    <PhotoAlbumSectionView
      items={data.images_activities || []}
      uploadTitle={t("uploadTitle")}
      uploadHint={t("uploadHint")}
      formatsNote={t("formatsNote")}
      uploadedTitle={t("uploadedTitle", {
        count: data.images_activities?.length || 0,
      })}
      onFilesSelected={handleFiles}
      onRemove={handleRemove}
      error={errors.images_activities?.[0]}
    />
  );
};
