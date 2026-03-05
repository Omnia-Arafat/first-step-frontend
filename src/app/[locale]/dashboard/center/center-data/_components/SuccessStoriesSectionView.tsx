"use client";

import { PortfolioFormData } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { ImageUploader } from "@/components/forms/ImageUploader";

type ActivityItem = NonNullable<PortfolioFormData["images_activities"]>[number];

export interface SuccessStoriesSectionViewProps {
  title: string;
  description: string;
  addLabel: string;
  storyImageLabel: string;
  imageHint: string;
  caseTypeLabel: string;
  caseTypePlaceholder: string;
  summaryLabel: string;
  summaryPlaceholder: string;
  activities: ActivityItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof ActivityItem, value: unknown) => void;
}

export function SuccessStoriesSectionView({
  title,
  description,
  addLabel,
  storyImageLabel,
  imageHint,
  caseTypeLabel,
  caseTypePlaceholder,
  summaryLabel,
  summaryPlaceholder,
  activities,
  onAdd,
  onRemove,
  onChange,
}: SuccessStoriesSectionViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-start">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-mid-gray text-sm">{description}</p>
      </div>

      <div className="space-y-12">
        {activities.map((activity, index) => (
          <div
            key={activity.id ?? index}
            className="relative p-6 border rounded-2xl bg-gray-50/30 space-y-6"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 ltr:right-2 rtl:left-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2 text-start">
                <Label className="text-base font-medium">{storyImageLabel}</Label>
                <ImageUploader
                  value={activity.image || null}
                  onChange={(file) => onChange(index, "image", file)}
                  aspectRatio="aspect-21/9"
                />
                <p className="text-sm text-mid-gray">{imageHint}</p>
              </div>

              <div className="space-y-2 text-start">
                <Label htmlFor={`kind-${index}`} className="text-base font-medium">
                  {caseTypeLabel}
                </Label>
                <Input
                  id={`kind-${index}`}
                  placeholder={caseTypePlaceholder}
                  value={activity.kind || ""}
                  onChange={(e) => onChange(index, "kind", e.target.value)}
                  className="bg-white py-6"
                />
              </div>

              <div className="space-y-2 text-start">
                <Label htmlFor={`summary-${index}`} className="text-base font-medium">
                  {summaryLabel}
                </Label>
                <Textarea
                  id={`summary-${index}`}
                  placeholder={summaryPlaceholder}
                  value={activity.summary || ""}
                  onChange={(e) => onChange(index, "summary", e.target.value)}
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
        onClick={onAdd}
      >
        <Plus className="w-6 h-6 ltr:mr-2 rtl:ml-2" />
        {addLabel}
      </Button>
    </div>
  );
}
