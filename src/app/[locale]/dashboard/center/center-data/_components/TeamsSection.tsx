"use client";

import { useTranslations } from "next-intl";
import { PortfolioFormData } from "@/types";
import { Input } from "@/components/ui/input";
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

export const TeamsSection = ({ data, onChange, errors = {} }: Props) => {
  const t = useTranslations("dashboard.profileEditor.teams");
  const teams = data.teams || [];

  const handleAdd = () => {
    onChange({
      teams: [...teams, { name: "", mission: "", image: "" }],
    });
  };

  const handleRemove = (index: number) => {
    const itemToRemove = teams[index];
    const newTeams = teams.filter((_, i) => i !== index);

    const updates: Partial<PortfolioFormData> = {
      teams: newTeams,
    };

    if (itemToRemove.id) {
      updates.delete_team_ids = [
        ...(data.delete_team_ids || []),
        itemToRemove.id,
      ];
    }

    onChange(updates);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], [field]: value };
    onChange({ teams: newTeams });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-start">
        <h3 className="text-xl font-bold">{t("title")}</h3>
        <p className="text-mid-gray text-sm">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {teams.map((member, index) => (
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

            <div className="flex flex-col gap-6">
              {/* Image Upload */}
              <div className="space-y-2 text-start shrink-0">
                <Label className="text-base font-medium">
                  {t("memberImage")}
                </Label>
                <div className="flex justify-center">
                  <ImageUpload
                    value={member.image}
                    onChange={(file) => handleChange(index, "image", file)}
                    hint={t("imageHint")}
                  />
                </div>
              </div>

              <div className="space-y-6 grow text-start">
                {/* Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor={`name-${index}`}
                    className="text-base font-medium"
                  >
                    {t("memberName")}
                  </Label>
                  <Input
                    id={`name-${index}`}
                    placeholder={t("memberNamePlaceholder")}
                    value={member.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    className="bg-white py-6"
                  />
                </div>

                {/* Mission / Specialization */}
                <div className="space-y-2">
                  <Label
                    htmlFor={`mission-${index}`}
                    className="text-base font-medium"
                  >
                    {t("memberSpecialization")}
                  </Label>
                  <Input
                    id={`mission-${index}`}
                    placeholder={t("memberSpecializationPlaceholder")}
                    value={member.mission}
                    onChange={(e) =>
                      handleChange(index, "mission", e.target.value)
                    }
                    className="bg-white py-6"
                  />
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
        {t("addMember")}
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
      className="relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white group overflow-hidden"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-full">
          <Image
            src={preview}
            alt="Team Member"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-mid-gray">
          <Upload className="w-6 h-6" />
          <span className="text-[10px]">{hint}</span>
        </div>
      )}
    </div>
  );
};
