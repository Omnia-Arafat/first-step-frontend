import {
  EstablishmentHeader,
  AboutSection,
  RatingsSection,
  BlogsSection,
  CouponsSection,
  SuggestedEstablishmentsSection,
  ProgramsSection,
} from "../../_components";
import SuccessStoriesSection from "./_components/SuccessStoriesSection";
import OurTeamSection from "./_components/OurTeamSection";
import OurNumbersSection from "./_components/OurNumbersSection";
import ServicesSection from "./_components/ServicesSection";
import ProfileWaitingPage from "@/components/general/nurseries/ProfileWaitingPage";
import { slugToReadableName } from "@/lib/utils";
import { establishmentService } from "@/services/api";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ name: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name, locale } = await params;
  const idMatch = name.match(/^(\d+)-(.*)$/);
  const id = idMatch ? idMatch[1] : null;

  try {
    let portfolio;
    if (id) {
      const response = await establishmentService.getEstablishmentPortfolioById(
        id,
        locale,
      );
      portfolio = response?.data as any;
    } else {
      const response = await establishmentService.getEstablishmentPortfolio(
        name,
        locale,
      );
      portfolio = response?.data as any;
    }

    if (!portfolio) throw new Error();

    return {
      title: portfolio.hero_section?.title_of_hero || portfolio.nursery_name,
      description: portfolio.hero_section?.description || "",
    };
  } catch {
    return {
      title: "Establishment Details",
    };
  }
}

export default async function CenterPage({
  params,
}: {
  params: Promise<{ name: string; locale: string }>;
}) {
  const { name, locale } = await params;
  const t = await getTranslations("centerDetails");

  // Extract ID from URL (expected format: [id]-[slug])
  const idMatch = name.match(/^(\d+)-(.*)$/);
  const id = idMatch ? idMatch[1] : null;
  const slugPart = idMatch ? idMatch[2] : name;
  const readableName = slugToReadableName(slugPart);

  // Fetch basic portfolio data to check existence
  let portfolioResponse;
  if (id) {
    portfolioResponse =
      await establishmentService.getEstablishmentPortfolioById(id, locale);
  } else {
    portfolioResponse = await establishmentService.getEstablishmentPortfolio(
      name,
      locale,
    );
  }

  const portfolio = portfolioResponse?.data as any;

  if (!portfolio) {
    return (
      <div>
        <ProfileWaitingPage
          nurseryName={readableName}
          locale={locale}
          userRole="center"
        />
      </div>
    );
  }

  const centerIdStr = id || String(portfolio.center_id || portfolio.id);

  return (
    <div className="min-h-screen bg-background py-12">
      {/* Header Section */}
      <EstablishmentHeader
        name={portfolio.user_name || readableName}
        tagline={portfolio.hero_section?.subtitle_of_hero || ""}
        logo={portfolio.center_logo || ""}
        rating={4.5}
        centerId={centerIdStr}
        tNamespace="centerDetails"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Right Column (Main): About → Services → Plans → Success Stories → Advertisement */}
          <div className="lg:col-span-7  flex flex-col gap-10 order-1">
            {/* About Section */}
            {/* {(portfolio.hero_section?.subtitle_of_hero ||
              portfolio.hero_section?.description) && (
              <AboutSection
                title={t("about.title")}
                subtitle={portfolio.hero_section?.subtitle_of_hero || ""}
                description={portfolio.hero_section?.description || ""}
              />
            )} */}

            {/* Services Section */}
            <ServicesSection
              title={t("services.title")}
              services={portfolio.services || []}
              locale={locale}
            />

            {/* Plans / Programs Section */}
            <ProgramsSection
              centerId={centerIdStr}
              nurseryName={name}
              locale={locale}
              tNamespace="centerDetails"
            />

            {/* Success Stories Section */}
            {portfolio.images_activities &&
              portfolio.images_activities.some((story: any) => story.image) && (
                <SuccessStoriesSection
                  stories={portfolio.images_activities || []}
                />
              )}

            {/* Advertisement Section */}
            {/* <section id="advertisement" className="py-0 scroll-mt-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <h2 className="heading-4 font-bold text-primary">
                  {locale === "ar" ? "مساحة إعلانية" : "Advertisement Space"}
                </h2>
              </div>

              <div
                className="relative w-full overflow-hidden rounded-2xl bg-linear-to-br from-blue-50 via-purple-50 to-cyan-50 p-4 flex items-center justify-center"
                style={{
                  height: "280px",
                }}
              >
                {/* Offer Alert Illustration - Bottom Right (LTR) / Bottom Left (RTL) */}
                <div className="absolute ltr:right-0 rtl:left-0 bottom-0 w-48 h-48 ltr:translate-x-4 rtl:-translate-x-4 translate-y-4 pointer-events-none select-none">
                  <img
                    src="/assets/illustrations/offer-alert.png"
                    alt="offer alert"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Center Text */}
                <div className="relative z-10 text-center px-8">
                  <p
                    className="text-xl md:text-2xl font-bold leading-relaxed"
                    style={{ color: "#8E8E8E" }}
                  >
                    {locale === "ar"
                      ? "انتظروا عروض وأنشطة رائعة"
                      : "Expect great offers and activities"}
                  </p>
                </div>
              </div>
            </section> */}
          </div>

          {/* Left Column (Sidebar): Our Numbers → Coupons → Our Team → Evaluations → Recommended → Blog */}
          <div className="lg:col-span-5 order-2 flex flex-col gap-10">
            {/* Our Numbers Section */}
            <OurNumbersSection
              statistics={portfolio.statistics || []}
              nurseryState={portfolio.nursery_state}
            />

            {/* Coupons Section */}
            <CouponsSection
              centerId={centerIdStr}
              nurseryLogo={portfolio.center_logo || ""}
              tNamespace="centerDetails"
            />

            {/* Our Team Section */}
            <OurTeamSection teams={portfolio.teams || []} />

            {/* Evaluations / Ratings Section */}
            <RatingsSection tNamespace="centerDetails" />

            {/* Suggested Establishments Section */}
            <SuggestedEstablishmentsSection
              currentCenterId={centerIdStr}
              tNamespace="centerDetails"
            />

            {/* Blog Section */}
            <BlogsSection centerId={centerIdStr} tNamespace="centerDetails" />
          </div>
        </div>
      </div>
    </div>
  );
}
