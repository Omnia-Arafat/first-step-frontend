"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { websiteService } from "@/services/api";
import { EstablishmentLogo } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const EstablishmentsCarousel = () => {
  const t = useTranslations("HomePage.PartnersCarousel");
  const locale = useLocale() as "ar" | "en";
  const isRtl = locale === "ar";

  const { data: logos = [], isLoading } = useQuery({
    queryKey: ["website-logos", locale],
    queryFn: () => websiteService.getLogos(locale),
    select: (data: EstablishmentLogo[]) =>
      data.filter((item) => item.logo && item.name),
  });

  if (!isLoading && logos.length === 0) return null;

  const items = isLoading ? Array.from({ length: 8 }) : [...logos, ...logos];

  return (
    <section className="py-16 overflow-hidden">
      {/* Label */}
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-primary-blue text-center">{t("title")}</h2>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute inset-y-0 start-0 w-28 z-10 pointer-events-none bg-linear-to-r from-white to-transparent dark:from-background" />
        <div className="absolute inset-y-0 end-0 w-28 z-10 pointer-events-none bg-linear-to-l from-white to-transparent dark:from-background" />

        {/* Track */}
        <div
          className={cn(
            "flex items-center gap-20 w-max",
            "animate-[marquee_75s_linear_infinite]",
            "hover:paused",
            isRtl && "direction-reverse",
          )}
        >
          {items.map((logo, index) =>
            isLoading || !logo ? (
              <Skeleton key={index} className="h-16 w-24 rounded shrink-0" />
            ) : (
              <Image
                key={`${(logo as EstablishmentLogo).center_id}-${index}`}
                src={(logo as EstablishmentLogo).logo}
                alt={(logo as EstablishmentLogo).name}
                width={120}
                height={120}
                className="object-contain h-16 w-auto shrink-0 transition-all duration-300"
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
};

export default EstablishmentsCarousel;
