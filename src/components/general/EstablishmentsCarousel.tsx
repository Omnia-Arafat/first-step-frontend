"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { websiteService } from "@/services/api";
import { EstablishmentLogo } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <section className="py-12 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-primary-blue text-center">{t("title")}</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          direction: isRtl ? "rtl" : "ltr",
          loop: logos.length > 4,
        }}
        className="relative"
      >
        {/* Fade edges */}
        <div className="absolute inset-y-0 start-0 w-24 bg-gradient-to-e from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 end-0 w-24 bg-gradient-to-s from-white to-transparent z-10 pointer-events-none" />

        <CarouselContent className="-ml-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </CarouselItem>
              ))
            : logos.map((logo) => (
                <CarouselItem
                  key={`${logo.center_id}-${logo.logo}`}
                  className="pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <div className="flex items-center justify-center w-full h-24 bg-white rounded-2xl shadow-[0_2px_20px_0_rgba(34,34,34,0.06)] px-4">
                    <Image
                      src={logo.logo}
                      alt={logo.name}
                      width={120}
                      height={60}
                      className="object-contain max-h-14 w-auto"
                    />
                  </div>
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default EstablishmentsCarousel;
