"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeader from "./SectionHeader";
import { Button } from "@/components/ui/button";

const RatingsSection = ({
  tNamespace = "nurseryDetails",
}: {
  tNamespace?: string;
}) => {
  const t = useTranslations(`${tNamespace}.ratings` as any);

  return (
    <section id="ratings" className="py-0 scroll-mt-20">
      <div className="mb-8">
        <SectionHeader
          title={t("title")}
          countText={t("count", { count: 0 })}
        />
      </div>

      <div className="bg-white-out p-4 rounded-3xl flex flex-col items-center justify-center text-center">
        <div className="relative w-full max-w-58 aspect-square mb-4">
          <Image
            src="/assets/illustrations/emotions.png"
            alt="emotions"
            fill
            className="object-contain"
          />
        </div>

        <h3 className="heading-4 font-medium text-primary mb-6 max-w-lg leading-relaxed">
          {t("placeholder")}
        </h3>

        <Button
          size="long"
          onClick={() => {
            document.getElementById("programs")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          {t("bookNow")}
        </Button>
      </div>
    </section>
  );
};

export default RatingsSection;
