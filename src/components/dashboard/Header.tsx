"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { parentService } from "@/services/dashboardApi";
import {
  Bell,
  Settings,
  Search,
  Maximize2,
  Minimize2,
  X,
  CreditCard,
  User,
  Shield,
  FileText,
  HelpCircle,
  Mail,
  LogOut,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useDashboardSearch } from "@/hooks/use-dashboard-search";
import SearchResults from "./SearchResults";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Switch } from "@/components/ui/switch";
import clsx from "clsx";
import { useAuthStore } from "@/store/authStore";
import { useUserPreferencesStore } from "@/store/userPreferencesStore";
import { useLogout } from "@/lib/auth-utils";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

type BreadcrumbItem = {
  title: string;
  url: string;
};

type RouteConfig = {
  path: string;
  titleKey: string;
  children?: RouteConfig[];
};

type HeaderProps = {
  onToggleFullscreen: () => void;
  sidebarOpen: boolean;
  secondarySidebarOpen: boolean;
};

export default function Header({
  onToggleFullscreen,
  sidebarOpen,
  secondarySidebarOpen,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard.header");
  const commonT = useTranslations("common");
  const languageT = useTranslations("language");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const authStore = useAuthStore();
  const userPreferencesStore = useUserPreferencesStore();
  const role = authStore.user?.role;
  const logout = useLogout();

  // Dashboard search functionality
  const {
    query,
    results,
    isSearching,
    isOpen,
    recentSearches,
    handleSearchChange,
    handleSearchSubmit,
    handleClose,
    handleOpen,
  } = useDashboardSearch();

  // Menu items configuration
  const settingsT = useTranslations("dashboard.header.settings");
  const menuItems = {
    // Toggle for enabling/disabling pusher notification toasts
    // This controls whether toast notifications appear when new pusher notifications arrive
    notifications: {
      icon: Bell,
      label: t("menu.notifications"),
      type: "toggle" as const,
      value: userPreferencesStore.preferences.notificationToastsEnabled,
      onChange: userPreferencesStore.setNotificationToastsEnabled,
    },
    separator1: { type: "separator" as const },
    billingControl:
      role === "center" || role === "nursery"
        ? {
            icon: CreditCard,
            label: t("menu.billing"),
            type: "link" as const,
            href: `/dashboard/${role}/billing`,
          }
        : undefined,
    accountData:
      role !== "admin"
        ? {
            icon: User,
            label: t("menu.accountData"),
            type: "link" as const,
            href: `/dashboard/${role}/account`,
          }
        : undefined,
    separator2: { type: "separator" as const },
    privacyPolicy: {
      icon: Shield,
      label: t("menu.privacyPolicy"),
      type: "link" as const,
      href: "/privacy-policy",
    },
    termsConditions: {
      icon: FileText,
      label: t("menu.termsConditions"),
      type: "link" as const,
      href: "/terms-conditions",
    },
    faqs: {
      icon: HelpCircle,
      label: t("menu.faqs"),
      type: "link" as const,
      href: "/faqs",
    },
    contactUs: {
      icon: Mail,
      label: t("menu.contactUs"),
      type: "link" as const,
      href: "/contact",
    },
    separator3: { type: "separator" as const },
    logout: {
      icon: LogOut,
      label: t("menu.logout"),
      type: "action" as const,
      variant: "destructive" as const,
      onClick: () => {
        logout();
      },
    },
  };

  const handleCloseAndBlur = () => {
    handleClose();
    setTimeout(() => setSearchFocused(false), 150);
  };

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          handleOpen();
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 100);
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleOpen, handleClose]);

  // Define all possible routes with their translations
  const routes: RouteConfig[] = [
    {
      path: "center",
      titleKey: "center",
      children: [
        { path: "", titleKey: "home" },
        { path: "branches", titleKey: "branches" },
        { path: "branches/add", titleKey: "addBranch" },
        { path: "branches/[branchId]", titleKey: "branchDetails" },
        { path: "children-files", titleKey: "childrenFiles" },
        { path: "children-files/[childId]", titleKey: "childDetails" },
        { path: "bookings", titleKey: "bookings" },
        { path: "daily-reports", titleKey: "dailyReports" },
        { path: "daily-reports/[reportId]", titleKey: "reportDetails" },
        { path: "daily-reports/send", titleKey: "sendReport" },
        { path: "site-edit", titleKey: "siteEdit" },
        { path: "ad-or-blog-request", titleKey: "adOrBlogRequest" },
        { path: "ad-or-blog-request/ad-request", titleKey: "adRequest" },
        { path: "ad-or-blog-request/blog-request", titleKey: "blogRequest" },
        { path: "notifications", titleKey: "notifications" },
        { path: "team", titleKey: "team" },
        { path: "team/add", titleKey: "addTeamMember" },
        { path: "team/[memberId]", titleKey: "teamMemberDetails" },
        { path: "discount-coupons", titleKey: "discountCoupons" },
      ],
    },
    {
      path: "parent",
      titleKey: "parent",
      children: [
        { path: "", titleKey: "home" },
        { path: "bookings", titleKey: "bookings" },
        { path: "children", titleKey: "myChildren" },
        { path: "children/add", titleKey: "addChild" },
        { path: "children/[childId]", titleKey: "childDetails" },
        { path: "daily-reports", titleKey: "dailyReports" },
        { path: "daily-reports/[reportId]", titleKey: "reportDetails" },
      ],
    },
    {
      path: "admin",
      titleKey: "admin",
      children: [
        { path: "", titleKey: "dashboard" },
        { path: "advertisement", titleKey: "advertisements" },
        { path: "advertisement/add", titleKey: "addAdvertisement" },
        { path: "advertisement/[adId]", titleKey: "advertisementDetails" },
        { path: "advertisement/center", titleKey: "advertisementCenter" },
        { path: "blog", titleKey: "blogs" },
        { path: "blog/add", titleKey: "addBlog" },
        { path: "blog/[blogId]", titleKey: "blogDetails" },
        { path: "blog/center", titleKey: "blogCenter" },
        { path: "bookings", titleKey: "allBookings" },
        { path: "branches", titleKey: "allBranches" },
        { path: "branches/[branchId]", titleKey: "branchDetails" },
        { path: "centers", titleKey: "centers" },
        { path: "centers/[centerId]", titleKey: "centerDetails" },
        { path: "children", titleKey: "allChildren" },
        { path: "children/[childId]", titleKey: "childDetails" },
        { path: "notifications", titleKey: "notifications" },
        { path: "parents", titleKey: "parents" },
        { path: "parents/[parentId]", titleKey: "parentDetails" },
      ],
    },
  ];

  // Generate breadcrumbs based on current path
  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const result: BreadcrumbItem[] = [];
    const segments = pathname.split("/").filter(Boolean);

    // Skip the locale segment if present
    const localeIndex = segments.findIndex(
      (s) => s === "ar" || s === "en" || s === "ku",
    );
    const pathSegments =
      localeIndex >= 0 ? segments.slice(localeIndex + 1) : segments;

    // If we're at the root dashboard, return empty array
    if (pathSegments.length <= 1) {
      return [];
    }

    // Find the matching route
    let currentRoutes = routes;
    let currentPath = "";

    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const isLast = i === pathSegments.length - 1;
      currentPath += `/${segment}`;

      // Find matching route
      const route = currentRoutes.find((r) => {
        // Handle dynamic segments
        if (r.path.startsWith("[") && r.path.endsWith("]")) {
          return true;
        }
        return r.path === segment;
      });

      if (route) {
        let title: string;

        // Try to get translation from the specific route first, then fallback to common
        try {
          title = t(`routes.${route.titleKey}`);
        } catch (e) {
          try {
            title = commonT(route.titleKey);
          } catch (e) {
            title = route.titleKey;
          }
        }

        // For dynamic segments, use the actual segment value in the title
        if (route.path.startsWith("[") && route.path.endsWith("]")) {
          title = `${title} #${segment}`;
        }

        result.push({
          title,
          url: `/${pathSegments[0]}${currentPath}`,
        });

        // Navigate to children routes if they exist
        if (route.children) {
          currentRoutes = route.children;
        } else if (!isLast) {
          // If no more children but we still have segments, add remaining segments
          const remainingPath = pathSegments.slice(i + 1).join("/");
          result.push({
            title: remainingPath,
            url: `/${pathSegments[0]}${currentPath}/${remainingPath}`,
          });
          break;
        }
      } else if (!isLast) {
        // If no matching route found but it's not the last segment, add it as is
        result.push({
          title: segment,
          url: `/${pathSegments[0]}${currentPath}`,
        });
      }
    }

    return result;
  }, [pathname, t, commonT]);

  return (
    <header className="flex items-center justify-between px-6 py-4.5">
      {/* Left: Sidebar toggle & Breadcrumbs */}
      <div className="w-fit flex items-center gap-x-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="fixed md:relative md:inset-0 left-4 top-4 rtl:left-auto rtl:right-4 flex justify-center items-center bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white/90 transition-colors rounded-lg size-8 cursor-pointer" />
        </div>

        {/* Breadcrumbs */}
        <Breadcrumb className="flex justify-center">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="line-clamp-1" title={item.title}>
                      {item.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.url}
                        className="line-clamp-1"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Fullscreen button and other controls */}
      <div className="flex-1 flex items-center justify-end gap-6">
        {/* Center Section - Search */}
        <div
          className={clsx(
            "hidden sm:block relative w-full transition-all duration-200",
            searchFocused ? "max-w-2xl mx-auto" : "max-w-52 mx-4",
          )}
        >
          <div className="relative">
            <Input
              ref={searchInputRef}
              type="search"
              className="z-50 relative rounded-full py-1.5 px-2.5 pr-11 placeholder:text-mid-gray"
              placeholder={t("search")}
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                handleOpen();
                setSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  handleClose();
                  searchInputRef.current?.blur();
                }
              }}
            />
            {query ? (
              <button
                onClick={() => {
                  handleSearchChange("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 size-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="size-4" />
              </button>
            ) : (
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-light-gray" />
            )}

            {/* Search Results */}
            <SearchResults
              isOpen={isOpen}
              query={query}
              results={results}
              recentSearches={recentSearches}
              isSearching={isSearching}
              onClose={handleCloseAndBlur}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>
        </div>

        <NotificationDropdown />

        <DashboardLanguageSwitcher />

        {/* Settings Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center hover:bg-gray-100 rounded-lg p-1 transition-colors">
              <Settings className="size-6 text-mid-gray cursor-pointer" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {Object.entries(menuItems).map(([key, item]) => {
              if (item?.type === "separator") {
                return <DropdownMenuSeparator key={key} />;
              }

              if (item?.type === "toggle") {
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.onChange}
                      className="data-[state=checked]:bg-secondary-mint-green"
                    />
                  </div>
                );
              }

              if (item?.type === "link") {
                return (
                  <DropdownMenuItem key={key} asChild>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              }

              if (item?.type === "action") {
                return (
                  <DropdownMenuItem
                    key={key}
                    variant={item.variant}
                    onClick={item.onClick}
                    className="cursor-pointer"
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              }

              return null;
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Fullscreen toggle (only on xl screens, far right) */}
        <button
          onClick={onToggleFullscreen}
          className="hidden xl:flex justify-center items-center bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white/90 transition-colors rounded-lg size-8 cursor-pointer"
          aria-label="Toggle fullscreen mode"
        >
          {sidebarOpen || secondarySidebarOpen ? (
            <Maximize2 className="size-4" />
          ) : (
            <Minimize2 className="size-4" />
          )}
        </button>
      </div>
    </header>
  );
}

function DashboardLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const languageT = useTranslations("language");
  const language = locale === "en" ? languageT("en") : languageT("ar");
  const iconSrc =
    locale === "en" ? "/assets/icons/english.svg" : "/assets/icons/arabic.svg";

  const toggleLanguage = (newLocale: "ar" | "en") => {
    // Use the i18n pathname (without locale) and let the router handle locale switching
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center hover:bg-gray-100 rounded-lg p-1 transition-colors">
          <div className="flex items-center gap-x-1.5">
            <Image src={iconSrc} alt="language" width={20} height={20} />
            <span className="text-sm font-medium text-mid-gray">
              {language}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => toggleLanguage("ar")}>
          <div className="flex items-center justify-between w-full gap-x-2">
            <div className="flex items-center gap-x-2">
              <Image
                src="/assets/icons/arabic.svg"
                alt="arabic"
                width={20}
                height={20}
              />
              <span className="text-sm font-medium">{languageT("ar")}</span>
            </div>
            {locale === "ar" && <span className="text-xs text-primary">✓</span>}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleLanguage("en")}>
          <div className="flex items-center justify-between w-full gap-x-2">
            <div className="flex items-center gap-x-2">
              <Image
                src="/assets/icons/english.svg"
                alt="english"
                width={20}
                height={20}
              />
              <span className="text-sm font-medium">{languageT("en")}</span>
            </div>
            {locale === "en" && <span className="text-xs text-primary">✓</span>}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
