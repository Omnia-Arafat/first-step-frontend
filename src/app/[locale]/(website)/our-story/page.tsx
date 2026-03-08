import { Metadata } from "next";
import Hero from "@/components/general/about/Hero";
import Story from "@/components/general/about/Story";
import Vision from "@/components/general/about/Vision";
import Mission from "@/components/general/about/Mission";
import StatsMap from "@/components/general/about/StatsMap";
import WhyUs from "@/components/general/about/WhyUs";
import Bridge from "@/components/general/about/Bridge";

export const revalidate = 86400;

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise;
  return {
    title:
      params.locale === "ar"
        ? "قصتنا في First Step | رؤيتنا لتسهيل اختيار الحضانة والمركز التأهيلي في السعودية"
        : "Our Story at First Step | Our Vision for Simplifying Nursery and Rehabilitation Center Selection in Saudi Arabia",
    description:
      params.locale === "ar"
        ? "منصة First Step ولدت من حاجة حقيقية لتسهيل رحلة الأهل في اختيار حضانة أو مركز تأهيلي مناسب. نشاركك هنا القيم التي نؤمن بها، ورسالتنا تجاه كل طفل وأسرة."
        : "First Step platform was born from a real need to simplify parents' journey in choosing a suitable nursery or rehabilitation center. We share here our values and mission towards every child and family.",
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: "ar" | "en" }>;
}) {
  const { locale } = await params;

  return (
    <div>
      <Hero />
      <Story />
      <Vision />
      <Mission />
      <StatsMap />
      <WhyUs />
      <Bridge />
    </div>
  );
}
