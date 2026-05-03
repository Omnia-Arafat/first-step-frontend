"use client";

import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NavbarButton from "./NavbarButton";
import { useAuthToken } from "@/store/authStore";
import { cn } from "@/lib/utils";

// Simple browser detection for old browsers
const isOldBrowser = () => {
  if (typeof window === "undefined") return true; // Assume old browser during SSR

  // Check for modern features that old browsers don't have
  return !(
    "IntersectionObserver" in window &&
    "ResizeObserver" in window &&
    CSS.supports("display", "grid") &&
    CSS.supports("backdrop-filter", "blur(10px)")
  );
};

const Navbar = ({ children }: { children?: React.ReactNode }) => {
  const token = useAuthToken();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [needsOldBrowserFallback, setNeedsOldBrowserFallback] = useState(true); // Start with true for SSR
  const [buttonsVisible, setButtonsVisible] = useState(false); // New state for button visibility
  const [openMobileSubmenuId, setOpenMobileSubmenuId] = useState<number | null>(
    null,
  );
  const pathname = usePathname();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = (path: string) => pathname === path;

  const [isMounted, setIsMounted] = useState(false);

  // Check if we need old browser fallback and show buttons with animation
  useEffect(() => {
    setIsMounted(true);
    const isOld = isOldBrowser();
    setNeedsOldBrowserFallback(isOld);

    // Show buttons with a longer delay to ensure proper rendering and smoother animation
    const buttonTimer = setTimeout(() => {
      setButtonsVisible(true);
    }, 600); // Increased to 600ms for better stability

    // If it's a modern browser, remove the fallback styles after a short delay
    if (!isOld) {
      const timer = setTimeout(() => {
        setNeedsOldBrowserFallback(false);
      }, 100);
      return () => {
        clearTimeout(timer);
        clearTimeout(buttonTimer);
      };
    }

    return () => clearTimeout(buttonTimer);
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced toggle function with ref-based control
  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);

    // Use refs to ensure proper DOM manipulation for old browsers
    if (menuRef.current && overlayRef.current) {
      if (newState) {
        // Open menu
        menuRef.current.style.transform = "translateX(0)";
        overlayRef.current.style.opacity = "1";
        overlayRef.current.style.pointerEvents = "auto";

        // Focus management for accessibility
        setTimeout(() => {
          closeButtonRef.current?.focus();
        }, 100);
      } else {
        // Close menu
        menuRef.current.style.transform = isRtl
          ? "translateX(-100%)"
          : "translateX(100%)";
        overlayRef.current.style.opacity = "0";
        overlayRef.current.style.pointerEvents = "none";
      }
    }
  };

  // Force close menu (for old browsers that might not respond to state changes)
  const forceCloseMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileSubmenuId(null);
    if (menuRef.current && overlayRef.current) {
      menuRef.current.style.transform = isRtl
        ? "translateX(-100%)"
        : "translateX(100%)";
      overlayRef.current.style.opacity = "0";
      overlayRef.current.style.pointerEvents = "none";
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        forceCloseMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        forceCloseMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const t = useTranslations("navbar");

  const keys = [
    "home",
    "services",
    "establishments",
    "coupon-codes",
    "consultations",
    // "courses",
    "who-are-we",
  ];
  const links = keys.map((key, index) => {
    const baseLink = {
      id: index,
      title: t(`links.${key}.title`),
      path: t(`links.${key}.path`),
    };

    if (key === "who-are-we") {
      return {
        ...baseLink,
        items: [
          {
            title: t("links.blog.title"),
            path: t("links.blog.path"),
          },
          {
            title: t("links.story.title"),
            path: t("links.story.path"),
          },
          {
            title: t("links.contact.title"),
            path: t("links.contact.path"),
          },
        ],
      };
    }
    return baseLink;
  });

  const hoverEffect =
    "transition-all duration-300 ease-out group-hover:text-secondary-orange group-hover:[text-shadow:0_0_0.9px_currentColor]";

  return (
    <>
      <div className="relative w-full bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
        <div
          className={`relative container mx-auto px-4 transition-all duration-300 ${
            isScrolled ? "py-2" : "py-2.5"
          }`}
        >
          <div className="flex justify-between items-center gap-x-0">
            {/* Left */}
            <div className="flex-1">
              <Link className="inline-block w-fit" href={"/"}>
                <div
                  className={`relative transition-all duration-300 ${
                    isScrolled ? "w-[120px] " : "w-[180px] "
                  }`}
                  style={{
                    height: isScrolled ? "30px" : "45.7px",
                    aspectRatio: "236/59.9",
                  }}
                >
                  <Image
                    src="/assets/logos/complete_logo.svg"
                    alt="logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Centered navigation */}
            <div
              className={`hidden xl:block shrink-0 rounded-full transition-all duration-300 ${
                isScrolled ? "py-4 px-10" : "py-7 px-14"
              }`}
            >
              <ul className="flex justify-between items-center gap-x-9">
                {links.map((link: any) => {
                  const isCurrent =
                    isActive(link.path) ||
                    (link.items &&
                      link.items.some((item: any) => isActive(item.path)));

                  return (
                    <li
                      key={link.id}
                      className="relative inline-block font-medium text-center group"
                    >
                      <Link
                        href={link.path}
                        className={`text-base text-gray flex items-center justify-center gap-1 ${
                          isCurrent
                            ? "group-hover:text-secondary-orange duration-300"
                            : hoverEffect
                        } ${
                          isCurrent ? "text-xl font-extrabold text-primary" : ""
                        }`}
                      >
                        {link.title}
                        {link.items && (
                          <ChevronDown
                            size={14}
                            className="transition-transform duration-300 group-hover:rotate-180"
                          />
                        )}
                      </Link>

                      {link.items && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 hidden group-hover:block transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[200px] overflow-hidden">
                            {link.items.map((item: any) => (
                              <Link
                                key={item.path}
                                href={item.path}
                                className={`block px-4 py-3 text-sm text-gray hover:bg-emerald-50 hover:text-primary rounded-lg transition-all duration-200 rtl:text-right ltr:text-left ${
                                  isActive(item.path)
                                    ? "bg-emerald-50 text-primary font-bold"
                                    : ""
                                }`}
                              >
                                {item.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right - Mobile menu trigger */}
            <div className="flex-1 text-right flex items-center justify-end">
              {/* Enhanced Menu Icon */}
              <Button
                className="xl:hidden p-2 rounded-full bg-linear-to-t from-white from-30 to-emerald-50 text-gray-700"
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation menu"
                onClick={toggleMenu}
              >
                <Menu size={24} />
              </Button>

              <div className="ltr:ml-0 rtl:mr-0 hidden sm:block">
                {children ? children : <NavbarButton />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons - Fixed to viewport */}
      {/* {!token && (
        <div
          className={`z-9999 fixed top-72 ltr:-right-[120px] ltr:md:-right-[90px] rtl:-left-[120px] rtl:md:-left-[90px] -rotate-90 flex items-center gap-x-4 transition-all duration-800 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            buttonsVisible
              ? "opacity-100 translate-x-0 translate-y-0"
              : "opacity-0 ltr:translate-x-12 rtl:-translate-x-12 translate-y-4"
          }`}
          style={
            needsOldBrowserFallback
              ? {
                  // Fallback for old browsers that don't support ltr/rtl classes
                  top: "18rem", // 72 * 0.25rem = 18rem
                  right: "-7.5rem", // -120px = -7.5rem
                  transform: buttonsVisible
                    ? "rotate(-90deg)"
                    : "rotate(-90deg) translateX(3rem) translateY(1rem)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  opacity: buttonsVisible ? 1 : 0,
                  transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  // RTL support for old browsers
                  left: "auto",
                }
              : undefined
          }
        >
          <Button
            asChild
            size={"sm"}
            variant="defaultNoGradient"
            className={`bg-secondary-mint-green rounded-[8px] transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-gpu ${
              buttonsVisible
                ? "scale-100 rotate-0 shadow-lg"
                : "scale-75 rotate-12 shadow-none"
            }`}
          >
            <Link href={"/sign-up/parent"}>{t("buttons.join-parent")}</Link>
          </Button>
          <Button
            asChild
            size={"sm"}
            variant="defaultNoGradient"
            className={`bg-secondary-burgundy rounded-[8px] transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-150 transform-gpu ${
              buttonsVisible
                ? "scale-100 rotate-0 shadow-lg"
                : "scale-75 -rotate-12 shadow-none"
            }`}
          >
            <Link href={"/sign-up/center"}>{t("buttons.join-center")}</Link>
          </Button>
        </div>
      )} */}

      {/* Mobile Menu - Only render on client to avoid flash on reload */}
      {isMounted && (
        <>
          {/* Mobile Menu Overlay - Fixed to whole viewport */}
          <div
            ref={overlayRef}
            className={`z-10000 fixed top-0 left-0 w-screen h-screen bg-black/50 transition-opacity duration-300 ${
              isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={forceCloseMenu}
            aria-hidden="true"
            style={{
              // Fallback for old browsers
              opacity: isMenuOpen ? 1 : 0,
              pointerEvents: isMenuOpen ? "auto" : "none",
              width: "100vw",
              height: "100vh",
            }}
          />

          {/* Enhanced slide-out menu with ref */}
          <div
            ref={menuRef}
            className={`z-10001 fixed top-0 bottom-0 ltr:right-0 rtl:left-0 w-4/5 max-w-xs h-screen bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              isMenuOpen
                ? "translate-x-0"
                : "ltr:translate-x-full rtl:-translate-x-full"
            }`}
            style={{
              height: "100vh",
              // Fallback for old browsers
              transform: isMenuOpen
                ? "translateX(0)"
                : isRtl
                  ? "translateX(-100%)"
                  : "translateX(100%)",
            }}
          >
            {/* Menu header with enhanced close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                ref={closeButtonRef}
                onClick={forceCloseMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu items */}
            <div className="flex flex-col h-[calc(100vh-65px)] overflow-y-auto custom-scrollbar">
              <ul className="pt-2 pb-4">
                {links.map((link: any) => (
                  <li key={link.id}>
                    {link.items ? (
                      <button
                        onClick={() =>
                          setOpenMobileSubmenuId(
                            openMobileSubmenuId === link.id ? null : link.id,
                          )
                        }
                        className={`w-full px-6 py-4 text-base transition-colors duration-200 flex items-center justify-between ${
                          isActive(link.path) ||
                          link.items.some((item: any) => isActive(item.path))
                            ? "font-bold text-emerald-600 bg-emerald-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {link.title}
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-300",
                            openMobileSubmenuId === link.id && "rotate-180",
                          )}
                        />
                      </button>
                    ) : (
                      <Link
                        href={link.path}
                        className={`px-6 py-4 text-base transition-colors duration-200 flex items-center justify-between ${
                          isActive(link.path)
                            ? "font-bold text-emerald-600 bg-emerald-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={forceCloseMenu}
                      >
                        {link.title}
                      </Link>
                    )}
                    {link.items && openMobileSubmenuId === link.id && (
                      <ul className="bg-gray-50/50 animate-in slide-in-from-top-1 duration-200">
                        {link.items.map((item: any) => (
                          <li key={item.path}>
                            <Link
                              href={item.path}
                              className={`block ltr:px-12 rtl:px-12 py-3 text-sm transition-colors duration-200 ${
                                isActive(item.path)
                                  ? "font-extrabold text-emerald-600"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                              onClick={forceCloseMenu}
                            >
                              - {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              {/* Call to action button */}
              <div className="px-4 pb-4 mt-auto">
                {children ? children : <NavbarButton />}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
