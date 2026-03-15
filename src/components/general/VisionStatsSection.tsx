"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const VisionStatsSection = () => {
  const t = useTranslations("HomePage.VisionStats");
  const stats = t.raw("stats") as { value: string; label: string }[];

  return (
    <section className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="blue-gradient rounded-3xl py-12 px-6"
      >
        <h2 className="text-white text-center mb-10">{t("title")}</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              className="flex flex-col items-center text-center gap-y-2"
            >
              <span className="text-4xl lg:text-5xl font-extrabold text-white">
                {stat.value}
              </span>
              <span className="text-white/80 font-medium text-sm lg:text-base">
                {stat.label}
              </span>

              {/* Divider between items (except last) */}
              {index < stats.length - 1 && (
                <div className="hidden lg:block absolute h-12 w-px bg-white/20 top-1/2 -translate-y-1/2 end-0" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default VisionStatsSection;
