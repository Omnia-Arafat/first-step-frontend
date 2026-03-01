"use client";

import { useTranslations } from "next-intl";
import { PortfolioFormData } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Upload } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";

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
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-start">
        <h3 className="text-xl font-bold">{t("title")}</h3>
        <p className="text-mid-gray text-sm">{t("description")}</p>
      </div>

      <div className="space-y-12">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="relative p-6 border rounded-2xl bg-gray-50/30 space-y-6"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 ltr:right-2 rtl:left-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>

            <div className="grid grid-cols-1 gap-6">
              {/* Image Upload */}
              <div className="space-y-2 text-start">
                <Label className="text-base font-medium">
                  {t("storyImage")}
                </Label>
                <ImageUpload
                  value={activity.image}
                  onChange={(file) => handleChange(index, "image", file)}
                  hint={t("imageHint")}
                />
              </div>

              {/* Kind / Case Type */}
              <div className="space-y-2 text-start">
                <Label
                  htmlFor={`kind-${index}`}
                  className="text-base font-medium"
                >
                  {t("caseType")}
                </Label>
                <Input
                  id={`kind-${index}`}
                  placeholder={t("caseTypePlaceholder")}
                  value={activity.kind || ""}
                  onChange={(e) => handleChange(index, "kind", e.target.value)}
                  className="bg-white py-6"
                />
              </div>

              {/* Summary / Improvement */}
              <div className="space-y-2 text-start">
                <Label
                  htmlFor={`summary-${index}`}
                  className="text-base font-medium"
                >
                  {t("improvementSummary")}
                </Label>
                <Textarea
                  id={`summary-${index}`}
                  placeholder={t("improvementPlaceholder")}
                  value={activity.summary || ""}
                  onChange={(e) =>
                    handleChange(index, "summary", e.target.value)
                  }
                  className="bg-white min-h-[100px] resize-none"
                  maxLength={200}
                />
                <div className="text-xs text-end text-gray-400">
                  {activity.summary?.length || 0} / 200
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full py-8 border-dashed border-2 rounded-2xl text-primary text-lg font-bold hover:bg-primary/5"
        onClick={handleAdd}
      >
        <Plus className="w-6 h-6 ltr:mr-2 rtl:ml-2" />
        {t("addStory")}
      </Button>
    </div>
  );
};

interface ImageUploadProps {
  value?: File | string;
  onChange: (file: File) => void;
  hint: string;
}

const ImageUpload = ({ value, onChange, hint }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preview = value instanceof File ? URL.createObjectURL(value) : value;

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors bg-white group"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full aspect-21/9 rounded-xl overflow-hidden">
          <Image
            src={preview}
            alt="Success Story"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg text-gray-700">تحميل صوره</p>
            <p className="text-sm text-mid-gray mt-1">{hint}</p>
          </div>
        </div>
      )}
    </div>
  );
};
