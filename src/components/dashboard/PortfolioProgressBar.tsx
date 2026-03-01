"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useCenterStats } from "@/hooks/useCenterStats";
import { useHasRole, useAuthUser } from "@/store/authStore";
import { Link } from "@/i18n/navigation";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
}

const PortfolioProgressBar = () => {
  const t = useTranslations("dashboard.portfolioProgress");
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(true);
  const isCenter = useHasRole("center");
  const user = useAuthUser();
  const { data: portfolioData, isLoading: isLoadingPortfolio } = usePortfolio();
  const { stats, isLoading: isLoadingStats } = useCenterStats(
    isCenter ? "center" : "branch",
  );
  const isRTL = locale === "ar";

  // Get center name - prefer nursery_name, fallback to name
  const centerName = user?.nursery_name || user?.name || "";

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    if (isLoadingPortfolio || isLoadingStats || !portfolioData || !stats) {
      return 0;
    }

    let completedTasks = 0;
    const totalTasks = 5;

    // Task 1: Add branches
    if (stats.total_branches && stats.total_branches > 0) {
      completedTasks++;
    }

    // Task 2: Register children (center's children)
    if (stats?.total_children && stats?.total_children > 0) {
      completedTasks++;
    }

    // Task 3: Complete profile (portfolio has essential data)
    const hasProfileData =
      portfolioData.title_of_hero ||
      portfolioData.subtitle_of_hero ||
      portfolioData.description;
    if (hasProfileData) {
      completedTasks++;
    }

    // Task 4: Free advertisement (ads_images)

    // Task 5: Write blog (we'll check if there's a blog request or published blog)
    // For now, we'll consider it incomplete as we don't have direct blog data
    // This can be enhanced later with actual blog data

    return Math.round((completedTasks / totalTasks) * 100);
  };

  const completionPercentage = calculateCompletion();

  // Define tasks
  const tasks: Task[] = [
    {
      id: "branches",
      title: t("tasks.branches.title"),
      description: t("tasks.branches.description"),
      completed: !!(stats?.total_branches && stats.total_branches > 0),
      link: "/dashboard/nursery/branches",
    },
    {
      id: "children",
      title: t("tasks.children.title"),
      description: t("tasks.children.description"),
      completed: !!(stats?.total_children && stats?.total_children > 0),
      link: "/dashboard/nursery/children-files",
    },
    {
      id: "profile",
      title: t("tasks.profile.title"),
      description: t("tasks.profile.description"),
      completed: !!(
        portfolioData &&
        (portfolioData.title_of_hero ||
          portfolioData.subtitle_of_hero ||
          portfolioData.description)
      ),
      link: "/dashboard/nursery/center-data",
    },
    // {
    //   id: "advertisement",
    //   title: t("tasks.advertisement.title"),
    //   description: t("tasks.advertisement.description"),
    //   completed: !!(
    //     portfolioData?.ads_images && portfolioData.ads_images.length > 0
    //   ),
    //   link: "/dashboard/nursery/ad-or-blog-request",
    // },
    {
      id: "blog",
      title: t("tasks.blog.title"),
      description: t("tasks.blog.description"),
      completed: false, // This can be enhanced with actual blog data
      link: "/dashboard/nursery/ad-or-blog-request",
    },
  ];

  return (
    <div className="relative" style={{ zIndex: 20 }}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="overflow-hidden shadow-[0_0_2px_rgba(0,0,0,.08)] relative cursor-pointer"
        style={{
          background:
            "linear-gradient(175.14deg, rgba(255, 255, 255, 0.16) 3.92%, rgba(131, 203, 170, 0.12) 59.8%, rgba(131, 203, 170, 0.24) 91.21%)",
          maxWidth: "880px",
          width: "100%",
          minHeight: "112px",
          borderRadius: "8px",
          paddingTop: "16px",
          paddingRight: "24px",
          paddingBottom: "16px",
          paddingLeft: "36px",
        }}
      >
        {/* Chevron Button - Top left in Arabic, Top right in English */}
        <div
          className={`absolute text-[#5B21B6] pointer-events-none ${
            isRTL ? "top-4 left-4" : "top-4 right-4"
          }`}
          style={{ zIndex: 40 }}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>

        {/* Header Section */}
        <div
          className={`flex items-center gap-6 h-full ${
            isRTL ? "flex-row-reverse" : "flex-row"
          }`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Percentage - Far left in Arabic, Far right in English */}
          <div
            className={`flex items-center flex-shrink-0 ${
              isRTL ? "order-1" : "order-4"
            }`}
          >
            <span
              className="font-tajawal font-bold text-gray-800 leading-none"
              style={{
                fontSize: "36px",
                lineHeight: "100%",
                textAlign: isRTL ? "right" : "left",
              }}
            >
              %{completionPercentage}
            </span>
          </div>

          {/* Welcome message and question - Middle */}
          <div
            className={`flex-1 ${
              isRTL ? "text-right order-2" : "text-left order-2"
            }`}
          >
            <h2
              className="font-tajawal font-bold text-gray-800 mb-2"
              style={{
                fontSize: "16px",
                lineHeight: "100%",
                textAlign: isRTL ? "right" : "left",
              }}
            >
              {isRTL ? (
                <>👋 {t("welcome", { centerName })}</>
              ) : (
                <>{t("welcome", { centerName })} 👋</>
              )}
            </h2>
            <p
              className="font-tajawal font-medium text-gray-700"
              style={{
                fontSize: "12px",
                lineHeight: "100%",
                textAlign: isRTL ? "right" : "left",
              }}
            >
              {t("question")}
            </p>
          </div>

          {/* Illustration Image - Right in Arabic, Left in English */}
          <div className={`flex-shrink-0 ${isRTL ? "order-3" : "order-1"}`}>
            <Image
              src="/assets/illustrations/progress-bar-portfolio-img.svg"
              alt="Portfolio Progress"
              width={92.43}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-8 space-y-3" onClick={(e) => e.stopPropagation()}>
            {tasks.map((task) => {
              const TaskContent = (
                <div
                  key={task.id}
                  className={`flex items-start justify-between gap-4 p-4 rounded-lg transition-all ${
                    task.completed
                      ? "bg-green-50/50"
                      : "bg-transparent hover:bg-white/50"
                  } ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {/* Radio check cycle next to title */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? "border-[#2B3990]"
                          : "border-gray-300 bg-white"
                      }`}
                      style={{
                        transition: "border-color 0.3s ease, padding 0.3s ease",
                        padding: task.completed ? "4px" : "0px",
                      }}
                    >
                      {task.completed && (
                        <div
                          className="rounded-full"
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#2B3990",
                          }}
                        ></div>
                      )}
                    </div>
                  </div>

                  {/* Title and description */}
                  <div
                    className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>

                  {/* Arrow icon on the other side */}
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-colors hover:text-gray-600 ${
                        isRTL ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              );

              return task.link ? (
                <Link
                  key={task.id}
                  href={task.link}
                  className="block cursor-pointer"
                >
                  {TaskContent}
                </Link>
              ) : (
                TaskContent
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioProgressBar;
