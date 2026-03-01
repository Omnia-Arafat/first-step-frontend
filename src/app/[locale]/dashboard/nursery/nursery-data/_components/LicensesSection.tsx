"use client";

import { useTranslations } from "next-intl";
import { PortfolioFormData } from "@/types";
import { Plus, Trash2, FileText, Upload, X, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { toastError } from "@/lib/toast";

interface Props {
  data: PortfolioFormData;
  onChange: (data: Partial<PortfolioFormData>) => void;
  errors?: Record<string, string[]>;
}

export const LicensesSection = ({ data, onChange, errors = {} }: Props) => {
  const t = useTranslations("dashboard.profileEditor.licenses");
  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    if (data.licenses && data.licenses.length > 0) {
      setIsToggled(true);
    }
  }, [data.licenses]);

  const handleAddLicense = () => {
    const newLicenses = [...(data.licenses || []), { number: "" }];
    onChange({ licenses: newLicenses });
  };

  const handleRemoveLicense = (index: number) => {
    const updated = [...(data.licenses || [])];
    const removedItem = updated[index];

    if (removedItem.id) {
      onChange({
        licenses: updated.filter((_, i) => i !== index),
        delete_license_ids: [
          ...(data.delete_license_ids || []),
          removedItem.id,
        ],
      });
    } else {
      updated.splice(index, 1);
      onChange({ licenses: updated });
    }
  };

  const updateLicense = (index: number, field: string, value: any) => {
    const updated = [...(data.licenses || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ licenses: updated });
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (file.size > MAX_SIZE) {
      toastError(t("title"), t("formatsNote"));
      return;
    }

    updateLicense(index, "document", file);
  };

  const handleViewDocument = (document: File | string) => {
    if (typeof document === "string") {
      window.open(document, "_blank");
    } else if (document instanceof File) {
      const url = URL.createObjectURL(document);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-8 text-start">
      {/* Licensed Toggle */}
      <div
        onClick={() => {
          const becomingActive = !isToggled;
          setIsToggled(becomingActive);
          if (!becomingActive) {
            // Keep existing IDs but clear local data if needed,
            // or just let the user toggle back.
            // Usually, if they disable it, we might want to clear the array.
          } else if (!data.licenses || data.licenses.length === 0) {
            handleAddLicense();
          }
        }}
        className={cn(
          "flex items-center justify-between p-4 sm:p-6 rounded-2xl border cursor-pointer transition-all duration-300",
          isToggled
            ? "blue-gradient text-white border-indigo-50"
            : "bg-indigo-50/50 border-indigo-100",
        )}
      >
        <div className="space-y-1">
          <h4
            className={cn(
              "font-bold text-base sm:text-lg",
              isToggled ? "text-white" : "text-primary",
            )}
          >
            {t("nurseryLicensed")}
          </h4>
          <p
            className={cn(
              "text-sm",
              isToggled ? "text-white/80" : "text-gray-500",
            )}
          >
            {t("licensedDescription")}
          </p>
        </div>
        <Switch
          checked={isToggled}
          onCheckedChange={() => {}} // Handled by container onClick
          className={cn(
            "pointer-events-none",
            isToggled &&
              "data-[state=checked]:bg-white data-[state=checked]:[&>span]:bg-primary",
          )}
        />
      </div>

      {isToggled && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          {data.licenses?.map((license, index) => (
            <div key={index} className="space-y-4">
              {index > 0 && <div className="border-t border-gray-100 pt-6" />}
              <div className="flex justify-between items-center px-1">
                <span className="text-primary font-bold text-sm">
                  {t("title")} #{index + 1}
                </span>
                {data.licenses && data.licenses.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLicense(index)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg px-2 h-8"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span className="text-xs">{t("deleteLicense")}</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* License Number */}
                <div className="space-y-2 text-start">
                  <Label className="text-base text-gray-700">
                    {t("licenseNumber")} *
                  </Label>
                  <Input
                    placeholder={t("licenseNumberPlaceholder")}
                    value={license.number || ""}
                    onChange={(e) =>
                      updateLicense(index, "number", e.target.value)
                    }
                    className="bg-gray-50/50 py-6 focus:bg-white transition-colors"
                  />
                  {errors[`licenses.${index}.number`] && (
                    <p className="text-sm text-destructive mt-1">
                      {errors[`licenses.${index}.number`][0]}
                    </p>
                  )}
                </div>

                {/* Document Upload */}
                <div className="space-y-2 text-start">
                  <Label className="text-base text-gray-700">
                    {t("licenseDocument")} *
                  </Label>
                  <div className="relative group">
                    <input
                      type="file"
                      id={`license-doc-${index}`}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(index, e.target.files)}
                    />
                    <label
                      htmlFor={`license-doc-${index}`}
                      className={cn(
                        "flex items-center justify-between w-full h-[52px] bg-gray-50/50 border border-transparent rounded-lg cursor-pointer hover:border-primary/30 hover:bg-white transition-all px-4",
                        license.document && "bg-green-50/30 border-green-100",
                      )}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        {license.document ? (
                          <>
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-green-700 font-medium truncate">
                              {license.document instanceof File
                                ? license.document.name
                                : typeof license.document === "string"
                                  ? license.document.split("/").pop()
                                  : t("licenseDocument")}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-lg bg-gray-200/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <Upload className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">
                              {t("uploadDocument")}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {license.document && (
                          <>
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleViewDocument(license.document!);
                              }}
                              className="w-8 h-8 rounded-xl hover:bg-primary/10 flex items-center justify-center text-gray-400 hover:text-primary transition-all shadow-none border-none"
                            >
                              <Eye className="w-4 h-4" />
                            </div>
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateLicense(index, "document", undefined);
                              }}
                              className="w-8 h-8 rounded-xl hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-none border-none"
                            >
                              <X className="w-4 h-4" />
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  {errors[`licenses.${index}.document`] && (
                    <p className="text-sm text-destructive mt-1">
                      {errors[`licenses.${index}.document`][0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button
            size="sm"
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleAddLicense}
          >
            <Plus className="w-5 h-5" />
            {t("addLicense")}
          </Button>
        </div>
      )}
    </div>
  );
};
