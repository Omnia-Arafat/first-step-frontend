"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const EducationAwarenessSection = () => {
  const t = useTranslations("consultations");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [multiplier, setMultiplier] = useState(120);

  const guides = (t.raw("tips.parents") as any[]).map((tip: any) => ({
    ...tip,
    image: tip.image || "/assets/illustrations/parent.png",
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const availableWidth = Math.min(width, 1400) - 400;
      const newMultiplier = Math.min(Math.max(availableWidth / 7, 70), 180);
      setMultiplier(newMultiplier);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % guides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [guides.length]);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-secondary-mint-green/10">
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-blue text-center">
          {t("tipsTitle")}
        </h2>
      </div>

      <div className="relative h-[400px] md:h-[608px] overflow-hidden px-6 md:px-12 lg:px-20">
        <div className="absolute inset-0 flex items-center justify-center">
          {guides.map((tip, index) => {
            const totalItems = guides.length;
            let distance = index - selectedIndex;
            if (distance > totalItems / 2) distance -= totalItems;
            if (distance < -totalItems / 2) distance += totalItems;

            const absDistance = Math.abs(distance);
            const isActive = distance === 0;

            if (absDistance > 3) return null;

            const zIndex = 40 - absDistance;
            const scale = isActive ? 1 : 0.85 - absDistance * 0.05;
            const translateX = distance * multiplier;
            const rotateY = distance * -3;

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="absolute transition-all duration-500 ease-out cursor-pointer focus:outline-none"
                style={{
                  zIndex,
                  transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                }}
              >
                <div
                  className={cn(
                    "w-[260px] sm:w-[320px] md:w-[480px] lg:w-[540px] rounded-3xl border py-11 px-4 sm:px-6 md:px-8 flex flex-col items-center text-center transition-all duration-500",
                    isActive
                      ? "border-secondary-mint-green bg-white bg-linear-to-b from-white/15 via-secondary-mint-green/12 to-secondary-mint-green/24"
                      : "bg-white border-light-gray"
                  )}
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-64 md:h-64 lg:w-80 lg:h-80 mb-3 sm:mb-4 md:mb-6 pointer-events-none">
                    <Image
                      src={tip.image}
                      alt={tip.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="max-w-[400px] text-xl md:text-2xl lg:text-[2rem] text-primary-blue mb-2 sm:mb-3 md:mb-4 leading-tight">
                    {tip.title}
                  </h3>
                  <p className="max-w-[400px] text-sm md:text-base lg:text-xl font-normal">
                    {tip.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {guides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === selectedIndex
                ? "bg-primary-blue w-6"
                : "bg-primary-blue/30"
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default EducationAwarenessSection;
