"use client";

import { useTranslations } from "next-intl";
import { PortfolioFormData } from "@/types";
import { Upload, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toastError } from "@/lib/toast";
import Image from "next/image";

// The shape of a single activity item in PortfolioFormData
type ActivityItem = NonNullable<PortfolioFormData["images_activities"]>[number];

interface Props {
  data: PortfolioFormData;
  onChange: (data: Partial<PortfolioFormData>) => void;
  errors?: Record<string, string[]>;
}

export const ActivitiesSection = ({ data, onChange, errors = {} }: Props) => {
  const t = useTranslations("dashboard.profileEditor.activities");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track original server-side IDs so we can mark them for deletion
  const initialIdsRef = useRef<number[]>([]);
  const isInitializedRef = useRef(false);
  const lastServerCountRef = useRef(0);

  useEffect(() => {
    if (!data.images_activities) return;

    // Server images are items that have a numeric id (they came from the API)
    const serverItems = data.images_activities.filter(
      (item): item is ActivityItem & { id: number } =>
        typeof item.id === "number",
    );

    // Reset tracking when the server count changes (after a save/delete)
    if (
      serverItems.length !== lastServerCountRef.current &&
      isInitializedRef.current
    ) {
      isInitializedRef.current = false;
      initialIdsRef.current = [];
    }

    // Capture initial server IDs only once on mount (or after reset)
    if (!isInitializedRef.current && serverItems.length > 0) {
      initialIdsRef.current = serverItems.map((item) => item.id);
      lastServerCountRef.current = serverItems.length;
      isInitializedRef.current = true;
    }
  }, [data.images_activities]);

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

    // If the removed item had a server-side ID, track it for deletion
    if (typeof itemToRemove.id === "number") {
      updates.delete_images_activities = [
        ...(data.delete_images_activities || []),
        itemToRemove.id,
      ];
    }

    onChange(updates);
  };

  /** Resolve a display URL from an activity item */
  const resolveUrl = (item: ActivityItem): string | null => {
    if (item.image instanceof File) return URL.createObjectURL(item.image);
    if (typeof item.image === "string" && item.image) return item.image;
    return null;
  };

  return (
    <div className="space-y-6 lg:space-y-8 text-start">
      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-6 lg:p-12 text-center transition-all cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-gray-200 bg-gray-50/30 hover:border-primary/50 hover:bg-gray-50",
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <div className="space-y-1 mb-4 sm:mb-6">
            <h4 className="text-lg sm:text-xl font-bold text-gray-800">
              {t("uploadTitle")}
            </h4>
            <p className="text-mid-gray text-base sm:text-lg">
              {t("uploadHint")}
            </p>
          </div>

          <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-xs text-mid-gray mt-2">{t("formatsNote")}</p>
        </div>
      </div>

      {/* Uploaded Grid */}
      {data.images_activities && data.images_activities.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-primary text-lg px-1">
            {t("uploadedTitle", { count: data.images_activities.length })}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.images_activities.map((item, index) => {
              const url = resolveUrl(item);
              if (!url) return null;

              return (
                <div
                  key={item.id ?? index}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-light-gray group bg-gray-50"
                >
                  <Image
                    src={url}
                    alt={item.kind || `Activity ${index + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      className="w-9 h-9 rounded-full"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {errors.images_activities && (
        <p className="text-sm text-destructive px-1">
          {errors.images_activities[0]}
        </p>
      )}
    </div>
  );
};
