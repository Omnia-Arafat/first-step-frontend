"use client";

import { useTranslations } from "next-intl";
import { PortfolioFormData } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Facebook, Instagram, Linkedin, Twitter, Globe } from "lucide-react";

interface Props {
  data: PortfolioFormData;
  onChange: (data: Partial<PortfolioFormData>) => void;
  errors?: Record<string, string[]>;
}

export const SocialMediaSection = ({ data, onChange, errors = {} }: Props) => {
  const t = useTranslations("dashboard.profileEditor.socialMedia");

  const socialLinks = [
    {
      id: "facebook",
      label: t("facebook"),
      icon: Facebook,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "instagram",
      label: t("instagram"),
      icon: Instagram,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      id: "linkedin",
      label: t("linkedin"),
      icon: Linkedin,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      id: "twitter",
      label: t("twitter"),
      icon: Twitter,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
    {
      id: "website",
      label: t("website"),
      icon: Globe,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
  ];

  return (
    <div className="space-y-6 text-start">
      <p className="text-sm text-mid-gray font-medium px-1">
        {t("optionalNote")}
      </p>

      <div className="grid gap-6">
        {socialLinks.map((link) => (
          <div
            key={link.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-all"
          >
            <div className="flex items-center gap-3 sm:w-42 shrink-0">
              <div className="bg-primary/5 text-primary p-2 sm:p-2.5 rounded-xl flex items-center justify-center shrink-0">
                <link.icon className="w-5 h-5" />
              </div>
              <Label className="text-sm sm:text-base font-medium text-gray-700 whitespace-nowrap">
                {link.label}
              </Label>
            </div>

            <div className="flex-1 space-y-1">
              <Input
                placeholder={
                  link.id === "website"
                    ? "https://yourwebsite.com"
                    : `https://${link.id}.com/username`
                }
                value={(data.contact_info as any)?.[link.id] || ""}
                onChange={(e) =>
                  onChange({
                    contact_info: {
                      ...data.contact_info,
                      [link.id]: e.target.value,
                    },
                  })
                }
                className="bg-gray-50/50 py-5 sm:py-6 rounded-xl border-transparent focus:bg-white focus:border-primary/30 transition-all text-sm sm:text-base"
              />
              {errors[`contact_info.${link.id}`] && (
                <p className="text-sm text-destructive px-1">
                  {errors[`contact_info.${link.id}`][0]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
