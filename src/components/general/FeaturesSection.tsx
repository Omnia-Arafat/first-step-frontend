"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Icons } from "@/components/general/icons";

const GRADIENT =
  "linear-gradient(98.52deg, #7A8CFD 11.17%, #404FB1 63.74%, #2B3990 94.71%)";

const FeatureItem = ({ text, delay }: { text: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.4, ease: "easeOut", delay }}
    className="flex items-start gap-x-3"
  >
    <Icons.featureCheck className="size-7 shrink-0 mt-0.5" />
    <p className="text-mid-gray font-medium leading-relaxed">{text}</p>
  </motion.div>
);

const FeaturesSection = () => {
  const t = useTranslations("HomePage.Features");

  const centerFeatures = t.raw("centerFeatures") as string[];
  const parentFeatures = t.raw("parentFeatures") as string[];

  return (
    <section className="container px-4 mx-auto py-16">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-primary-blue text-center mb-12"
      >
        {t("title")}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Centers card */}
        <div
          className="py-8 px-6 lg:px-10 rounded-3xl flex flex-col"
          style={{
            background:
              "linear-gradient(175.14deg, rgba(255,255,255,0.16) 3.92%, rgba(131,203,170,0.12) 59.8%, rgba(131,203,170,0.24) 91.21%)",
          }}
        >
          <h3 className="heading-4 font-bold text-primary-blue text-center mb-8 pb-4 border-b border-gray-100">
            {t("centersTitle")}
          </h3>
          <div className="flex flex-col gap-y-5 flex-1">
            {centerFeatures.map((feature, index) => (
              <FeatureItem key={index} text={feature} delay={index * 0.08} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center text-white font-semibold"
              style={{
                background: GRADIENT,
                width: "220px",
                height: "48px",
                borderRadius: "8px",
              }}
            >
              {t("centersButton")}
            </Link>
          </div>
        </div>

        {/* Parents card */}
        <div
          className="py-8 px-6 lg:px-10 rounded-3xl flex flex-col"
          style={{
            background:
              "linear-gradient(175.14deg, rgba(255,255,255,0.16) 3.92%, rgba(131,203,170,0.12) 59.8%, rgba(131,203,170,0.24) 91.21%)",
          }}
        >
          <h3 className="heading-4 font-bold text-primary-blue text-center mb-8 pb-4 border-b border-gray-100">
            {t("parentsTitle")}
          </h3>
          <div className="flex flex-col gap-y-5 flex-1">
            {parentFeatures.map((feature, index) => (
              <FeatureItem key={index} text={feature} delay={index * 0.08} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link
              href="/establishments"
              className="inline-flex items-center justify-center text-white font-semibold"
              style={{
                background: GRADIENT,
                width: "220px",
                height: "48px",
                borderRadius: "8px",
              }}
            >
              {t("parentsButton")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
