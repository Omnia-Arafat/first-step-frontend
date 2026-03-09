import { Icons } from "../icons";
import { useTranslations } from "next-intl";

const Hero = () => {
  const t = useTranslations("about.hero");

  const features = [
    {
      icon: <Icons.aboutCenters className="h-7 w-7 text-[#2B3990]" />,
      label: t("features.centers"),
    },
    {
      icon: <Icons.aboutChild className="h-7 w-7 text-[#2B3990]" />,
      label: t("features.growth"),
    },
    {
      icon: <Icons.aboutFamily className="h-7 w-7 text-[#2B3990]" />,
      label: t("features.safety"),
    },
  ];

  return (
    <section
      className="relative z-0 w-full overflow-hidden bg-[#F9FAFB] bg-cover bg-center bg-no-repeat px-4 pb-20 pt-16 md:pt-24"
      style={{ backgroundImage: "url('/assets/backgrounds/about-bg.jpg')" }}
    >
      <div className="container relative z-10 mx-auto flex flex-col items-center justify-center text-center max-w-[1000px]">
        {/* Central icon with floating dots */}
        <div
          className="relative mb-12 flex items-center justify-center"
          style={{ width: 180, height: 180 }}
        >
          {/* Main solid dark blue circle */}
          <div
            className="relative z-10 flex shrink-0 items-center justify-center rounded-full shadow-[0_10px_25px_rgba(43,57,144,0.15)]"
            style={{
              width: 140,
              height: 140,
              background: "#2B3990",
            }}
          >
            <Icons.aboutChild className="h-16 w-16 text-white" />
          </div>

          {/* Floating colored dots positioned around the circle */}
          <span
            className="absolute rounded-full bg-[#B12F53] z-0"
            style={{ width: 16, height: 16, top: 12, left: 24 }}
          />
          <span
            className="absolute rounded-full bg-[#83CBAA] z-20"
            style={{ width: 44, height: 44, top: 8, right: 4 }}
          />
          <span
            className="absolute rounded-full bg-[#F47E42] z-0"
            style={{ width: 36, height: 36, bottom: 10, left: 14 }}
          />
        </div>

        {/* Title */}
        <h1 className="mb-6 max-w-4xl font-bold text-[#2B3990] text-[32px] md:text-[44px] lg:text-[50px] leading-[1.3]">
          {t("title")}
        </h1>

        {/* Description */}
        <p className="mb-14 max-w-[850px] text-base md:text-lg lg:text-[20px] leading-relaxed text-[#6B7280]">
          {t("description")}
        </p>

        {/* Feature icons */}
        <div className="flex flex-row items-center justify-center gap-6 md:gap-12 w-full mt-4">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-white border-[1.5px] border-[#E5E7EB] shadow-sm">
                {feature.icon}
              </div>
              <span className="text-sm md:text-base font-semibold text-[#6B7280]">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
