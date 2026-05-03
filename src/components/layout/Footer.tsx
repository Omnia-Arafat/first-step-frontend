"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toastSuccess, toastError } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { subscribeToNewsletterAction } from "@/actions/websiteActions";
import { Icons } from "../general/icons";
import { Loader2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto max-w-full w-full box-border overflow-hidden">
      <div>
        <div className="flex flex-col container mx-auto px-4">
          <div className="w-full flex flex-col md:flex-row">
            {/* Left section (Red) */}
            <TopLeftSection />

            {/* Right section (Green) */}
            <TopRightSection />
          </div>

          <div className="w-full flex flex-col md:flex-row">
            {/* Navy blue section */}
            <BottomLeftSection />

            {/* Red section */}
            <BottomRightSection />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

const TopLeftSection = () => {
  const t = useTranslations("footer");
  const [email, setEmail] = useState("");

  const subscribeMutation = useMutation({
    mutationFn: (email: string) => subscribeToNewsletterAction(email),
    onSuccess: () => {
      toastSuccess(
        t("newsletter.successTitle"),
        t("newsletter.successMessage"),
      );
    },
    onError: (error: any) => {
      toastError(
        t("newsletter.errorTitle"),
        error.message || t("newsletter.errorMessage"),
      );
    },
  });

  return (
    <div className="relative order-2 flex-1/2 xl:flex-4/12 bg-primary-blue text-white flex flex-col items-center md:items-end justify-between pt-10 pb-5 rtl:md:pr-10 ltr:md:pl-10">
      <div className="-z-50 absolute top-0 bottom-0 right-[-500%] left-[-500%] rtl:md:right-0 ltr:md:left-0 bg-primary-blue" />

      <div className="w-full flex flex-col items-center md:items-start space-y-4">
        <p className="text-xl font-medium text-right">
          {t("newsletter.title")}
        </p>

        <div className="flex flex-col items-center sm:flex-row w-full gap-3">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await subscribeMutation.mutateAsync(email);
              setEmail("");
            }}
            className="w-full flex flex-col sm:flex-row gap-3"
          >
            <div className="relative grow w-full sm:w-auto order-1 sm:order-1 flex bg-white rounded-lg items-center">
              <Input
                className="border-0! shadow-none! text-[#2A3342] text-xs pl-12 pr-5 py-5 rtl:pr-12 rtl:pl-5"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={subscribeMutation.isPending}
              />
              <div className="absolute inset-y-0 left-4 rtl:left-auto rtl:right-4 flex items-center">
                <Icons.mail className="stroke-gray-500" />
              </div>
            </div>
            <Button
              type="submit"
              size={"sm"}
              variant={"secondary"}
              className="bg-primary hover:bg-primary-blue-700 text-white border rounded-xl border-white! order-2"
              disabled={!email || subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("newsletter.button")
              )}
            </Button>
          </form>
          {/* {subscribeMutation.isError && (
            <p className="text-red-500 text-sm mt-1">
              {subscribeMutation.error?.message ||
                "Failed to subscribe. Please try again."}
            </p>
          )}
          {subscribeMutation.isSuccess && (
            <p className="text-green-500 text-sm mt-1">
              {t("newsletter.success")}
            </p>
          )} */}
        </div>

        <div className="text-center rtl:md:text-right ltr:md:text-left w-full md:w-auto">
          <p className="text-lg font-bold mb-3">{t("appDownloadTitle")}</p>
          <div className="flex gap-3 justify-center md:justify-end">
            <Link href="#" className="inline-block">
              <Image
                src="/assets/store/googleplay.png"
                alt="Get it on Google Play"
                width={138}
                height={40}
              />
            </Link>
            <Link href="#" className="inline-block">
              <Image
                src="/assets/store/appstore.png"
                alt="Download on the App Store"
                width={138}
                height={40}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopRightSection = () => {
  const t = useTranslations("footer");

  const keys = [
    "home",
    "services",
    "establishments",
    // "courses",
    "blog",
    "story",
    "contact",
    // "help",
    "privacy-policy",
    "terms-conditions",
  ];
  const links = keys.map((key, index) => {
    return {
      id: index,
      title: t(`links.${key}.title`),
      path: t(`links.${key}.path`),
    };
  });

  // const hoverEffect =
  //   "hover:text-primary hover:font-bold hover:text-xl hover:text-secondary-orange duration-300 ";
  // const linkClasses =
  //   "absolute inset-0 md:left-0 md:right-auto rtl:md:right-0 rtl:md:left-auto";

  return (
    <div className="relative md:order-1 flex-1/2 xl:flex-8/12 bg-primary flex flex-col justify-between pt-10 pb-5">
      <div className="-z-50 absolute top-0 bottom-0 right-[-500%] left-[-500%] rtl:md:left-0 ltr:md:right-0 bg-primary" />

      <div className="w-full mb-6 justify-items-center md:justify-items-start">
        <div className="flex justify-center md:justify-start mb-6">
          <Image
            src="/assets/logos/complete_logo_white.svg"
            alt="First Step"
            width={236.4}
            height={60}
          />
        </div>

        <div className="max-w-[523px] mt-6 font-medium">
          <nav>
            <ul className="flex flex-wrap justify-center md:justify-start gap-x-9 gap-y-2">
              {links.map((link) => (
                <li
                  key={link.id}
                  className="relative inline-block font-medium text-center"
                >
                  <Link
                    href={link.path}
                    className={`text-white hover:text-secondary-mint-green hover:underline duration-150 trasition`}
                  >
                    {link.title}
                  </Link>

                  {/* <span className="relative -top-1/2 pointer-events-none flex items-center justify-center md:justify-start text-xl font-bold opacity-0">
                    {link.title}
                  </span> */}
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-9 flex flex-wrap justify-center md:justify-start gap-x-9 gap-y-2">
            <p className="text-white font-medium">{t("contactTitle")}:</p>

            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/966539949732"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icons.whatsapp className="size-6 text-gray/60 hover:text-secondary-mint-green transition-colors duration-150" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BottomLeftSection = () => {
  return (
    <div className="order-2 relative flex-1/2 xl:flex-4/12 flex bg-primary-blue text-white pt-2.5 pb-5  text-center md:text-left">
      <div className="-z-50 absolute top-0 bottom-0 right-[-500%] left-[-500%] rtl:md:right-0 ltr:md:left-0 bg-primary-blue" />

      <p className="mt-auto w-full text-white font-medium ltr:md:text-right">
        © 2025 First Step. All rights reserved.
      </p>
    </div>
  );
};

const BottomRightSection = () => {
  const t = useTranslations("footer");

  const icons = [
    {
      title: "X",
      icon: Icons.twitter,
      link: "https://x.com/firststepapp",
    },
    {
      title: "LinkedIn",
      icon: Icons.linkedin,
      link: "https://www.linkedin.com/company/firststepapp",
    },
    {
      title: "Facebook",
      icon: Icons.facebook,
      link: "https://www.facebook.com/firststepapp",
    },
    {
      title: "Snapchat",
      icon: Icons.snapchat,
      link: "https://www.snapchat.com/add/first_stepsa",
    },
    {
      title: "Instagram",
      icon: Icons.instagram,
      link: "https://www.instagram.com/firststepapp.sa",
    },
    {
      title: "TikTok",
      icon: Icons.tiktok,
      link: "https://www.tiktok.com/@firststepapp",
    },
  ];

  return (
    <div className="md:order-1 relative flex-1/2 xl:flex-8/12 bg-primary-blue text-white pt-2.5 pb-5 flex justify-center md:justify-start items-center">
      <div className="-z-50 absolute top-0 bottom-0 right-[-500%] left-[-500%] rtl:md:left-0 ltr:md:right-0 bg-primary-blue" />

      <div className="flex flex-col gap-3 items-center md:items-start">
        <span className="font-bold">{t("followTitle")}</span>
        <div className="flex gap-4">
          {icons.map((item) => (
            <a
              target="_blank"
              key={item.title}
              href={item.link}
              className="group flex items-center justify-center"
              aria-label={item.title}
            >
              <item.icon className="text-white group-hover:text-secondary-mint-green duration-150 size-6" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
