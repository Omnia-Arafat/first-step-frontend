"use client";

import { useTranslations } from "next-intl";
import { PortfolioFormData } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

interface Props {
  data: PortfolioFormData;
  onChange: (data: Partial<PortfolioFormData>) => void;
  errors?: Record<string, string[]>;
}

const DEFAULT_STATS = [
  { address: "Years of Experience", value: "" },
  { address: "Children Helped", value: "" },
  { address: "Sessions Provided", value: "" },
  { address: "Certified Specialist", value: "" },
];

export const StatisticsSection = ({ data, onChange, errors = {} }: Props) => {
  const t = useTranslations("dashboard.profileEditor.statistics");
  const stats = data.statistics || [];

  // Ensure we have the 4 default stats
  useEffect(() => {
    if (stats.length === 0) {
      onChange({ statistics: DEFAULT_STATS });
    } else if (stats.length < 4) {
      // Merge existing with defaults if some are missing
      const merged = DEFAULT_STATS.map((def) => {
        const existing = stats.find((s) => s.address === def.address);
        return existing || def;
      });
      if (JSON.stringify(merged) !== JSON.stringify(stats)) {
        onChange({ statistics: merged });
      }
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], value };
    onChange({ statistics: newStats });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-start">
        <h3 className="text-xl font-bold">{t("title")}</h3>
        <p className="text-mid-gray text-sm">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2 text-start">
            <Label htmlFor={`stat-${index}`} className="text-base font-medium">
              {t(`labels.${stat.address.replace(/ /g, "")}`) || stat.address}
            </Label>
            <Input
              id={`stat-${index}`}
              placeholder="0"
              value={stat.value}
              onChange={(e) => handleChange(index, e.target.value)}
              className="bg-gray-50/50 py-6"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
