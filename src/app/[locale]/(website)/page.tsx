import { Metadata } from "next";
import Headline from "@/components/general/Headline";
import FeaturesSection from "@/components/general/FeaturesSection";
import SubscriptionSection from "@/components/general/SubscriptionSection";
import HeroWithEvents from "@/components/general/HeroWithEvents";
// import PreviewVideo from "@/components/general/PreviewVideo";
import SnapPageTracker from "@/components/SnapPageTracker";
import NurseriesPreviewSection from "@/components/general/NurseriesPreviewSection";
import AppsSection from "@/components/general/AppsSection";
import EstablishmentsCarousel from "@/components/general/EstablishmentsCarousel";
import VisionStatsSection from "@/components/general/VisionStatsSection";
import EducationAwarenessSection from "@/components/general/EducationAwarenessSection";

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
        ? "منصة First Step اختاري الحضانة المناسبة لطفلك بسهولة في السعودية"
        : "First Step Platform - Find the Perfect Nursery for Your Child in Saudi Arabia",
    description:
      params.locale === "ar"
        ? "اكتشفي أفضل الحضانات وروضات الأطفال الموثوقة في السعودية من مكان واحد. First Step تساعدك في اختيار حضانة توفر رعاية وتعليم متوازن لطفلك."
        : "Discover trusted nurseries and kindergartens in Saudi Arabia in one place. First Step helps you choose a nursery that provides balanced care and education for your child.",
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "ar" | "en" }>;
}) {
  const { locale } = await params;

  return (
    <main>
      <HeroWithEvents />
      <Headline />
      {/* <PreviewVideo /> */}
      <NurseriesPreviewSection locale={locale} />
      <FeaturesSection />
      <SubscriptionSection />
      <AppsSection />
      <EstablishmentsCarousel />
      <VisionStatsSection />
      <EducationAwarenessSection />
      <SnapPageTracker />
    </main>
  );
}
