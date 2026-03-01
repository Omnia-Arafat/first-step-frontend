"use client";

import SectionHeader from "./SectionHeader";

interface AboutSectionProps {
  title: string;
  subtitle: string;
  description: string;
}

const AboutSection = ({ title, subtitle, description }: AboutSectionProps) => {
  if (!subtitle && !description) return null;

  return (
    <section id="about" className="py-0 scroll-mt-20">
      <SectionHeader title={title} />
      <div className="bg-white-out rounded-2xl p-3 md:p-4">
        {subtitle && (
          <h3 className="heading-4 font-medium text-primary mb-4 leading-relaxed">
            {subtitle}
          </h3>
        )}
        {description && (
          <p className="text-gray leading-[1.8] font-medium">{description}</p>
        )}
      </div>
    </section>
  );
};

export default AboutSection;
