"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PortfolioFormData } from "@/types";
import { useEffect, useState, useRef } from "react";
import { dashboardIcons } from "@/components/general/icons";
import Image from "next/image";

interface Props {
  data: PortfolioFormData;
  onChange: (data: Partial<PortfolioFormData>) => void;
  errors?: Record<string, string[]>;
  logoUrl?: string;
  onLogoChange?: (file: File) => void;
}

export const BasicInfoSection = ({
  data,
  onChange,
  errors = {},
  logoUrl,
  onLogoChange,
}: Props) => {
  const t = useTranslations("dashboard.profileEditor.basicInfo");
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logoUrl) {
      setPreview(logoUrl);
    }
  }, [logoUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLogoChange) {
      onLogoChange(file);
      // Create preview
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Logo Upload */}
      <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6 lg:gap-8">
        <div className="relative group">
          <div className="w-30.5 h-30.5 rounded-full overflow-hidden bg-primary/5 flex items-center justify-center">
            {preview ? (
              <Image
                src={preview}
                alt="Nursery Logo"
                fill
                className="object-cover"
              />
            ) : (
              <dashboardIcons.userAvatar className="text-primary" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 ltr:right-0 rtl:left-0 cursor-pointer w-9 h-9 p-2 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center"
          >
            <dashboardIcons.camera className="w-5 h-5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="space-y-1 text-center sm:text-start pt-2 lg:pt-4 pb-1 lg:pb-2">
          <h3 className="text-base sm:text-lg font-bold">{t("nurseryLogo")}</h3>
          <p className="text-xs sm:text-sm text-mid-gray max-w-xs">
            {t("logoHint")}
          </p>
        </div>
      </div>

      {/* Nursery Name and Slogan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="space-y-2 text-start">
          <Label htmlFor="nurseryName" className="text-base font-medium">
            {t("nurseryName")}
          </Label>
          <Input
            id="nurseryName"
            placeholder={t("nurseryNamePlaceholder")}
            value={data.title_of_hero || ""}
            onChange={(e) => onChange({ title_of_hero: e.target.value })}
            className="bg-gray-50/50 py-6"
          />
          {errors.title_of_hero && (
            <p className="text-sm text-red-500 mt-1">
              {errors.title_of_hero[0]}
            </p>
          )}
        </div>
        <div className="space-y-2 text-start">
          <Label htmlFor="nurserySlogan" className="text-base font-medium">
            {t("nurserySlogan")}
          </Label>
          <Input
            id="nurserySlogan"
            placeholder={t("nurserySloganPlaceholder")}
            value={data.subtitle_of_hero || ""}
            onChange={(e) => onChange({ subtitle_of_hero: e.target.value })}
            className="bg-gray-50/50 py-6"
          />
          {errors.subtitle_of_hero && (
            <p className="text-sm text-red-500 mt-1">
              {errors.subtitle_of_hero[0]}
            </p>
          )}
        </div>
      </div>

      {/* Brief Description */}
      <div className="space-y-2 text-start">
        <div className="flex justify-between">
          <Label htmlFor="description" className="text-base font-medium">
            {t("briefDescription")}
          </Label>
          <span className="text-xs text-gray-400 pt-1">
            {t("descriptionLimit")}
          </span>
        </div>
        <Textarea
          id="description"
          placeholder={t("descriptionPlaceholder")}
          value={data.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          className="bg-gray-50/50 min-h-[120px] resize-none"
          maxLength={200}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description[0]}</p>
        )}
        <div className="text-xs text-end text-gray-400">
          {data.description?.length || 0} / 200
        </div>
      </div>
    </div>
  );
};
