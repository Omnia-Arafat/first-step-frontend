"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import SectionHeader from "../../../_components/SectionHeader";

interface AlbumsSectionProps {
  images: string[];
}

const AlbumsSection = ({ images }: AlbumsSectionProps) => {
  const t = useTranslations("nurseryDetails.albums");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback images if none provided
  const displayImages =
    images.length > 0
      ? images
      : [
          "/assets/illustrations/center.png",
          "/assets/illustrations/center.png",
          "/assets/illustrations/center.png",
        ];

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setActiveIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length,
    );
  };

  return (
    <section id="albums" className="py-0 scroll-mt-20">
      <Carousel
        opts={{
          align: "start",
          direction: isRtl ? "rtl" : "ltr",
        }}
        className="w-full"
      >
        <SectionHeader
          title={t("title")}
          countText={t("count", { count: displayImages.length })}
          showNavigation={true}
        />

        <div className="bg-white-out p-4 rounded-2xl flex flex-col gap-6">
          <CarouselContent className="-ml-4">
            {displayImages.map((src, index) => (
              <CarouselItem
                key={index}
                className="pl-4 basis-4/5 sm:basis-2/3 md:basis-1/2 lg:basis-1/2"
              >
                <div
                  className="group relative aspect-4/5 overflow-hidden rounded-2xl shadow-sm cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={src}
                    alt={`Album image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform scale-75 group-hover:scale-100 transition-transform">
                      <Maximize2 className="text-white w-6 h-6" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <Button
            size="long"
            variant="default"
            className="w-full! max-w-none"
            onClick={() => openLightbox(0)}
          >
            {t("viewAll")}
          </Button>
        </div>
      </Carousel>

      {/* Cinematic Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTitle className="sr-only">Image Gallery</DialogTitle>
            <DialogContent className="max-w-[100vw] w-full h-screen border-none bg-black/60 backdrop-blur-[60px] p-0 sm:max-w-full z-100 [&>button]:hidden">
              <div
                className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
                onClick={() => setIsOpen(false)}
              >
                {/* Minimal Header */}
                <div
                  className="absolute top-0 left-0 right-0 p-8 z-50 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-white/40 text-xs font-bold tracking-[0.3em] pl-4 uppercase">
                    {activeIndex + 1}{" "}
                    <span className="mx-3 text-white/10">—</span>{" "}
                    {displayImages.length}
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all duration-500 cursor-pointer group"
                  >
                    <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
                  </button>
                </div>

                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Fluid Navigation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-10 z-50 p-6 text-white/20 hover:text-white transition-all duration-700 disabled:opacity-0 cursor-pointer hidden sm:flex group"
                  >
                    <ChevronLeft className="w-10 h-10 stroke-[1px] transition-transform group-hover:-translate-x-2" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-10 z-50 p-6 text-white/20 hover:text-white transition-all duration-700 disabled:opacity-0 cursor-pointer hidden sm:flex group"
                  >
                    <ChevronRight className="w-10 h-10 stroke-[1px] transition-transform group-hover:translate-x-2" />
                  </button>

                  {/* Immersive Image Transition */}
                  <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-20 pointer-events-none">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={activeIndex}
                        initial={{
                          opacity: 0,
                          scale: 1.1,
                          x: isRtl ? -100 : 100,
                          filter: "blur(20px)",
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          x: 0,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                          x: isRtl ? 100 : -100,
                          filter: "blur(20px)",
                        }}
                        transition={{
                          duration: 0.8,
                          ease: [0.16, 1, 0.3, 1], // Custom Expo-Out ease for butter-smooth motion
                        }}
                        className="relative w-full h-full flex items-center justify-center pointer-events-auto"
                      >
                        <div className="relative w-full h-full max-w-7xl max-h-[75vh]">
                          <Image
                            src={displayImages[activeIndex]}
                            alt={`Gallery image ${activeIndex + 1}`}
                            fill
                            className="object-contain"
                            priority
                            sizes="100vw"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Floating Thumbnail Strip */}
                <div
                  className="absolute bottom-10 left-1/2 -translate-x-1/2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-3 p-2 bg-white/3 backdrop-blur-xl rounded-4xl border border-white/5 max-w-[80vw] overflow-x-auto no-scrollbar">
                    {displayImages.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex(idx);
                        }}
                        className={cn(
                          "relative w-14 h-14 rounded-full overflow-hidden transition-all duration-700 shrink-0 cursor-pointer",
                          activeIndex === idx
                            ? "ring-1 ring-white/40 ring-offset-4 ring-offset-transparent scale-110"
                            : "opacity-20 hover:opacity-100 hover:scale-105",
                        )}
                      >
                        <Image
                          src={src}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AlbumsSection;
