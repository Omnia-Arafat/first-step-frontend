import Image from "next/image";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { createSlug, mapOptions } from "@/lib/utils";
import { AGE_GROUP_IDS } from "@/lib/options";
import { useTranslations } from "next-intl";
import { EstablishmentResponse } from "@/types";

type LocaleKey = "ar" | "en";

const NurseryCard = ({
  nursery,
  locale,
}: {
  nursery: EstablishmentResponse;
  locale: LocaleKey;
}) => {
  const slug = createSlug(nursery.nursery_name, "ar");
  const t = useTranslations("options");

  // Create mapped options for age translations
  const ageOptions = mapOptions(AGE_GROUP_IDS, "centerAges", t);

  // Helper function to get translation by ID
  const getTranslationById = (
    id: string,
    options: { id: string; label: string }[],
  ) => {
    return options.find((option) => option.id === id)?.label || id;
  };

  // Get branches for display
  const branchNames =
    nursery.branches
      ?.map((branch: any) =>
        branch.nursery_name === "Main Branch"
          ? "الفرع الرئيسي"
          : branch.nursery_name,
      )
      .join("، ") || "الفرع الرئيسي";

  // Get main branch for location - use nursery data directly since branches don't have location info
  const mainBranch = nursery;

  // Get accepted ages for display
  const acceptedAges = (nursery.accepted_ages || [])
    .map((age: string) => getTranslationById(age, ageOptions))
    .join("، ");

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return { text, isTruncated: false };
    return {
      text: text.substring(0, maxLength) + "...",
      isTruncated: true,
    };
  };

  // Truncate branches and ages if too long
  const truncatedBranches = truncateText(branchNames, 50);
  const truncatedAges = truncateText(acceptedAges, 60);
  const shouldShowReadMore =
    truncatedBranches.isTruncated || truncatedAges.isTruncated;

  // Determine establishment route segment
  // The backend returns role as 'nursery', 'center' or plural
  const routeSegment =
    nursery.role === "center" || nursery.type === "centers"
      ? "centers"
      : "nurseries";

  // Get center_id from nested objects based on the establishment type
  const centerId =
    nursery.role === "center" || nursery.type === "centers"
      ? nursery.center?.center_id
      : nursery.nursery?.center_id;

  // Use center_id if available, otherwise fallback to nursery.id
  const displayId = centerId || nursery.id;

  // console.log(nursery);

  return (
    <Link
      href={`/establishments/${routeSegment}/${displayId}-${slug}`}
      className="block"
    >
      <div className="bg-white rounded-lg transition-all duration-300 hover:border hover:border-gray-200 hover:shadow-lg group flex flex-col h-full min-h-80">
        {/* Logo section - takes up half the card */}
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="flex-1 flex items-center justify-center">
            {nursery.logo ? (
              <Image
                src={
                  typeof nursery.logo === "string" &&
                  !nursery.logo.startsWith("/") &&
                  !nursery.logo.startsWith("http")
                    ? `/${nursery.logo}`
                    : nursery.logo
                }
                alt={`${nursery.nursery_name} logo`}
                width={120}
                height={120}
                className="object-contain max-w-[120px] max-h-[120px]"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-white to-secondary-mint-green/24 rounded flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">
                  {nursery.nursery_name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          {/* 3/4 width border line */}
          <div className="w-3/4 h-px bg-gray-200 mt-4"></div>
        </div>

        {/* Content section */}
        <div className="flex-1 p-6">
          {/* Title */}
          <h2 className="heading-4 font-bold text-center text-primary mb-4">
            {nursery.nursery_name}
          </h2>

          {/* Location */}
          {mainBranch.city ? (
            <div className="flex items-center justify-center gap-1 mb-4">
              <MapPin size={16} className="text-info" />
              <span className="text-sm text-gray text-center">
                {typeof mainBranch.city === "object"
                  ? mainBranch.city.name[locale]
                  : mainBranch.city}
                {typeof mainBranch.neighborhood === "object" &&
                mainBranch.neighborhood !== null
                  ? ", " + mainBranch.neighborhood[locale]
                  : ", " + mainBranch.neighborhood}
              </span>
            </div>
          ) : null}

          {/* Accepted Ages */}
          <div className="flex items-center justify-center gap-1 mb-4">
            <svg
              width={17}
              height={16}
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 8h.007M10.5 8h.007m-3.34 2.667c.333.2.8.333 1.333.333s1-.133 1.333-.333M13.167 4.2a6 6 0 0 1 1.2 2.6 1.333 1.333 0 0 1 0 2.4 6 6 0 0 1-11.734 0 1.333 1.333 0 0 1 0-2.4A6 6 0 0 1 8.5 2c1.333 0 2.333.733 2.333 1.667 0 .933-.6 1.666-1.333 1.666-.533 0-1-.266-1-.666"
                stroke="#83CBAA"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-gray">{truncatedAges.text}</span>
          </div>

          {/* Read More Link */}
          {shouldShowReadMore && (
            <div className="text-center mt-4">
              <span className="text-primary text-sm font-medium hover:underline cursor-pointer">
                {locale === "ar" ? "اقرأ المزيد..." : "Read more..."}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NurseryCard;
