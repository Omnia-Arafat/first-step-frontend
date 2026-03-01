import {
  EstablishmentHeader,
  AboutSection,
  AdsSection,
  RatingsSection,
  BlogsSection,
  CouponsSection,
  SuggestedEstablishmentsSection,
  ProgramsSection,
} from "../../_components";
import FacilitiesSection from "./_components/FacilitiesSection";
import AlbumsSection from "./_components/AlbumsSection";
import ServicesSection from "./_components/ServicesSection";
import ProfileWaitingPage from "@/components/general/nurseries/ProfileWaitingPage";
import { createSlug, slugToReadableName } from "@/lib/utils";
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
        "nursery",
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

export default async function NurseryPage({
  params,
}: {
  params: Promise<{ name: string; locale: string }>;
}) {
  const { name, locale } = await params;
  const t = await getTranslations("nurseryDetails");

  // Extract ID from URL (expected format: [id]-[slug])
  const idMatch = name.match(/^(\d+)-(.*)$/);
  const id = idMatch ? idMatch[1] : null;
  const slugPart = idMatch ? idMatch[2] : name;
  const readableName = slugToReadableName(slugPart);

  // Fetch basic portfolio data to check existence
  let portfolioResponse;
  if (id) {
    portfolioResponse =
      await establishmentService.getEstablishmentPortfolioById(
        id,
        locale,
        "nursery",
      );
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
        <ProfileWaitingPage nurseryName={readableName} locale={locale} />
      </div>
    );
  }

  const centerIdStr = id || String(portfolio.center_id || portfolio.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Section */}
      <EstablishmentHeader
        name={portfolio.hero_section?.title_of_hero || readableName}
        tagline={portfolio.hero_section?.subtitle_of_hero || ""}
        logo={portfolio.logo || ""}
        rating={4.5}
        centerId={centerIdStr}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Info Column: About & Facilities */}
          <div className="lg:col-span-7 flex flex-col gap-10 lg:gap-10 order-1">
            {/* About Section */}
            {(portfolio.hero_section?.subtitle_of_hero ||
              portfolio.hero_section?.description) && (
              <AboutSection
                title={t("about.title")}
                subtitle={portfolio.hero_section?.subtitle_of_hero || ""}
                description={portfolio.hero_section?.description || ""}
              />
            )}

            {/* Facilities Section */}
            <FacilitiesSection
              title={t("facilities.title")}
              facilities={portfolio.admin_options || []}
              locale={locale}
            />

            <ServicesSection
              title={t("services.title")}
              services={portfolio.services || []}
              locale={locale}
            />

            {/* Ads Section */}
            <AdsSection centerId={centerIdStr} />

            {/* Albums Section */}
            {portfolio.images_activities &&
              portfolio.images_activities.length > 0 && (
                <AlbumsSection images={portfolio.images_activities || []} />
              )}
          </div>

          {/* Sticky Sidebar Column: Programs */}
          <div className="lg:col-span-5 order-2 flex flex-col gap-10">
            <ProgramsSection
              centerId={centerIdStr}
              nurseryName={name}
              locale={locale}
            />

            {/* Coupons Section */}
            <CouponsSection
              centerId={centerIdStr}
              nurseryLogo={portfolio.user?.logo || portfolio.logo}
            />

            {/* Ratings Section */}
            <RatingsSection />

            {/* Blogs Section */}
            <BlogsSection centerId={centerIdStr} />

            {/* Suggested Establishments Section */}
            <SuggestedEstablishmentsSection currentCenterId={centerIdStr} />
          </div>
        </div>
      </div>
    </div>
  );
}
