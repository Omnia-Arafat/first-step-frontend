"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

const GRADIENT =
  "linear-gradient(98.52deg, #7A8CFD 11.17%, #404FB1 63.74%, #2B3990 94.71%)";

const APP_DATA = [
  {
    image: "/assets/backgrounds/apps-screens/parent-bg.png",
    googlePlay:
      "https://play.google.com/store/apps/details?id=com.firststep.firststepparent",
    appStore: "https://apps.apple.com/app/id6758555057",
  },
  {
    image: "/assets/backgrounds/apps-screens/center-bg.png",
    googlePlay:
      "https://play.google.com/store/apps/details?id=com.firststep.firststepapp",
    appStore: "https://apps.apple.com/app/id6752875206",
  },
  {
    image: "/assets/backgrounds/apps-screens/gate-bg.png",
    googlePlay:
      "https://play.google.com/store/apps/details?id=com.firststep.attendance",
    appStore: null, // still in review
  },
];

const AppCard = ({
  title,
  image,
  googlePlay,
  appStore,
  availableText,
}: {
  title: string;
  image: string;
  googlePlay: string;
  appStore: string | null;
  availableText: string;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group flex flex-col items-center justify-between text-center w-full max-w-[424px] min-h-[480px] rounded-[48px] p-8 gap-6 mx-auto transition-all duration-300 shadow-[0_2px_40px_0_rgba(34,34,34,0.07)]"
      style={{ background: hovered ? GRADIENT : "white" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* App screen image */}
      <div className="relative w-full flex-1 min-h-[280px]">
        <Image src={image} alt={title} fill className="object-contain" />
      </div>

      {/* App title */}
      <h3 className="heading-4 font-bold text-primary-blue group-hover:text-white transition-colors duration-300">
        {title}
      </h3>

      {/* Store buttons */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-mid-gray group-hover:text-white/80 transition-colors duration-300">
          {availableText}
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          <a
            href={googlePlay}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Image
              src="/assets/store/googleplay.png"
              alt="Get it on Google Play"
              width={130}
              height={38}
              className="h-10 w-auto"
            />
          </a>
          {appStore && (
            <a
              href={appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Image
                src="/assets/store/appstore.png"
                alt="Download on the App Store"
                width={130}
                height={38}
                className="h-10 w-auto"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const AppsSection = () => {
  const t = useTranslations("HomePage.AppsSection");
  const apps = t.raw("apps") as { title: string }[];

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-primary-blue text-center mb-12">{t("title")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
        {apps.map((app, index) => (
          <AppCard
            key={index}
            title={app.title}
            image={APP_DATA[index].image}
            googlePlay={APP_DATA[index].googlePlay}
            appStore={APP_DATA[index].appStore}
            availableText={t("available")}
          />
        ))}
      </div>
    </section>
  );
};

export default AppsSection;
