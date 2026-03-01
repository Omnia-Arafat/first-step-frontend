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

export const ServicesSection = ({ data, onChange, errors = {} }: Props) => {
  const t = useTranslations("dashboard.profileEditor.services");
  const services = data.services || [];

  const handleAdd = () => {
    onChange({
      services: [
        ...services,
        { title: "", description: "", price: "", image_service: "" },
      ],
    });
  };

  const handleRemove = (index: number) => {
    const serviceToRemove = services[index];
    const newServices = services.filter((_, i) => i !== index);

    const updates: Partial<PortfolioFormData> = {
      services: newServices,
    };

    if (serviceToRemove.id) {
      updates.delete_service_ids = [
        ...(data.delete_service_ids || []),
        serviceToRemove.id,
      ];
    }

    onChange(updates);
  };

  const handleChange = (
    index: number,
    field: "title" | "description" | "price" | "image_service",
    value: File | string,
  ) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    onChange({ services: newServices });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-start">
        <h3 className="text-xl font-bold">{t("title")}</h3>
        <p className="text-mid-gray text-sm">{t("description")}</p>
      </div>

      <div className="space-y-12">
        {services.map((service, index) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-start md:col-span-2">
                <Label className="text-base font-medium">
                  {t("serviceImage")}
                </Label>
                <ImageUpload
                  value={service.image_service}
                  onChange={(file) =>
                    handleChange(index, "image_service", file)
                  }
                  hint={t("imageHint")}
                />
                {errors[`services.${index}.image_service`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`services.${index}.image_service`][0]}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-start">
                <Label
                  htmlFor={`title-${index}`}
                  className="text-base font-medium"
                >
                  {t("serviceName")}
                </Label>
                <Input
                  id={`title-${index}`}
                  placeholder={t("serviceNamePlaceholder")}
                  value={service.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  className="bg-white py-6"
                />
                {errors[`services.${index}.title`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`services.${index}.title`][0]}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-start">
                <Label
                  htmlFor={`price-${index}`}
                  className="text-base font-medium"
                >
                  {t("price")}
                </Label>
                <Input
                  id={`price-${index}`}
                  placeholder="210"
                  type="text"
                  value={service.price}
                  onChange={(e) => handleChange(index, "price", e.target.value)}
                  className="bg-white py-6"
                />
                {errors[`services.${index}.price`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`services.${index}.price`][0]}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-start md:col-span-2">
                <Label
                  htmlFor={`desc-${index}`}
                  className="text-base font-medium"
                >
                  {t("serviceDescription")}
                </Label>
                <Textarea
                  id={`desc-${index}`}
                  placeholder={t("serviceDescriptionPlaceholder")}
                  value={service.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  className="bg-white min-h-[100px] resize-none"
                />
                {errors[`services.${index}.description`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`services.${index}.description`][0]}
                  </p>
                )}
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
        {t("addService")}
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
          <Image src={preview} alt="Service" fill className="object-cover" />
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
