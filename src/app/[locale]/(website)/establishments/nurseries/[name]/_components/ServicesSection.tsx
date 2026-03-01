"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SectionHeader from "../../../_components/SectionHeader";

interface Service {
  title: string;
  description: string;
  price: string;
  image_service: string;
}

interface ServicesSectionProps {
  title: string;
  services: Service[];
  locale: string;
}

const ServicesSection = ({
  title,
  services,
  locale: propLocale,
}: ServicesSectionProps) => {
  const t = useTranslations("nurseryDetails.services");
  const locale = useLocale();
  const isRtl = locale === "ar";

  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-0 scroll-mt-20">
      <Carousel
        opts={{
          align: "start",
          direction: isRtl ? "rtl" : "ltr",
        }}
        className="w-full"
      >
        <SectionHeader
          title={title}
          countText={t("count", { count: services.length })}
          showNavigation={true}
        />

        <div className="bg-white-out p-2 md:p-4 rounded-2xl">
          <CarouselContent className="mr-0">
            {services.map((service, index) => {
              const imageUrl = service.image_service.startsWith("http")
                ? service.image_service
                : `https://development.firststep-app.com/storage/${service.image_service}`;

              return (
                <CarouselItem key={index} className="pr-0 basis-full">
                  <div className="flex flex-col-reverse md:flex-row items-stretch gap-8 md:gap-[60px]">
                    <div className="flex-1 flex flex-col py-5">
                      <div className="space-y-4">
                        <h3
                          className={cn(
                            "heading-4 font-medium text-primary",
                            isRtl ? "text-right" : "text-left",
                          )}
                        >
                          {service.title}
                        </h3>
                        {service.description && (
                          <p
                            className={cn(
                              "text-gray leading-relaxed",
                              isRtl ? "text-right" : "text-left",
                            )}
                          >
                            {service.description}
                          </p>
                        )}

                        {service.price && (
                          <div className={cn("flex items-center gap-3 pt-2")}>
                            <span className="text-xl font-bold text-primary">
                              {service.price}
                            </span>
                            <span className="sar text-primary text-3xl">$</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-8">
                        <Button
                          className="min-w-full md:w-auto"
                          size="long"
                          variant="default"
                        >
                          {t("subscribe")}
                        </Button>
                      </div>
                    </div>

                    <div className="relative w-full md:w-[45%] aspect-square md:aspect-270/320 shrink-0">
                      <Image
                        src={imageUrl}
                        alt={service.title}
                        fill
                        className="object-cover rounded-2xl shadow-sm"
                      />
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
};

export default ServicesSection;
