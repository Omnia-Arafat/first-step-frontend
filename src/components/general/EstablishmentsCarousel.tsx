"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

// Placeholder partner logos - replace with real partner logos
const PARTNER_LOGOS = [
  { src: "/assets/logos/complete_logo.svg", alt: "First Step" },
  { src: "/assets/logos/complete_logo.svg", alt: "Partner 2" },
  { src: "/assets/logos/complete_logo.svg", alt: "Partner 3" },
  { src: "/assets/logos/complete_logo.svg", alt: "Partner 4" },
  { src: "/assets/logos/complete_logo.svg", alt: "Partner 5" },
  { src: "/assets/logos/complete_logo.svg", alt: "Partner 6" },
  { src: "/assets/logos/complete_logo.svg", alt: "Partner 7" },
  { src: "/assets/logos/complete_logo.svg", alt: "Partner 8" },
];

const EstablishmentsCarousel = () => {
  const t = useTranslations("HomePage.PartnersCarousel");
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate logos for infinite scroll effect
  const allLogos = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationId: number;
    let position = 0;
    const speed = 0.5;

    const itemWidth = 180; // px per item including gap
    const totalWidth = PARTNER_LOGOS.length * itemWidth;

    const animate = () => {
      position -= speed;
      if (Math.abs(position) >= totalWidth) {
        position = 0;
      }
      track.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="py-12 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-primary-blue text-center">{t("title")}</h2>
      </div>

      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute inset-y-0 start-0 w-24 bg-gradient-to-e from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 end-0 w-24 bg-gradient-to-s from-white to-transparent z-10 pointer-events-none" />

        <div ref={trackRef} className="flex gap-10 w-max">
          {allLogos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-40 h-24 bg-white rounded-2xl shadow-[0_2px_20px_0_rgba(34,34,34,0.06)] shrink-0 px-4"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={60}
                className="object-contain max-h-14 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EstablishmentsCarousel;
