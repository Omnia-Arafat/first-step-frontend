"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const FeaturesSection = () => {
  const t = useTranslations("HomePage.Features");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [isMdAndUp, setIsMdAndUp] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMdAndUp(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const features = [
    {
      title: t("childManagement.title"),
      description: t("childManagement.description"),
    },

    {
      title: t("taskOrganization.title"),
      description: t("taskOrganization.description"),
    },
    {
      title: t("professionalProfile.title"),
      description: t("professionalProfile.description"),
    },
    {
      title: t("dashboard.title"),
      description: t("dashboard.description"),
    },
    {
      title: t("bookingManagement.title"),
      description: t("bookingManagement.description"),
    },
    {
      title: t("adSpace.title"),
      description: t("adSpace.description"),
      comingSoon: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="container px-4 mx-auto py-16">
      <div className="mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut" as const,
          }}
          className="text-primary-blue text-center mb-12"
        >
          {t("title")}
        </motion.h2>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-3xl py-6 px-6 lg:px-10 2xl:px-20 bg-gradient-to-b from-white to-secondary-mint-green/24"
        >
          {features.map((feature, index) => {
            const customDelay = isMdAndUp ? Math.floor(index / 2) : index;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{
                  delay: isMdAndUp ? customDelay * 0.15 : customDelay * 0.08,
                }}
                className="flex gap-x-2"
              >
                <div className="aspect-square size-9 bg-secondary-mint-green rounded-full flex items-center justify-center shrink-0">
                  <Check className="size-6 text-white" />
                </div>

                <div className="flex flex-col gap-y-2">
                  <h3 className="heading-4 font-medium text-primary-blue">
                    <span>{feature.title}</span>{" "}
                    {feature.comingSoon && (
                      <span className="text-secondary-burgundy">
                        ({t("comingSoon")})
                      </span>
                    )}
                  </h3>
                  <p className="text-mid-gray flex-grow">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
