import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  const t = useTranslations("auth.sign-up");

  const roles = [
    {
      id: "parent",
      title: t("parent.title"),
      features: t.raw("parent.features") as string[],
      image: "/assets/illustrations/signup/parent.jpg",
      href: "/sign-up/parent",
      color: "border-gray-100",
    },
    {
      id: "rehab-center",
      title: t("rehab-center.title"),
      features: t.raw("rehab-center.features") as string[],
      image: "/assets/illustrations/signup/rehabilitation-center.png",
      href: "/sign-up/center",
      color: "border-gray-100",
    },
    {
      id: "nursery",
      title: t("nursery.title"),
      features: t.raw("nursery.features") as string[],
      image: "/assets/illustrations/signup/nursery.jpg",
      href: "/sign-up/nursery",
      color: "border-gray-100",
    },
    {
      id: "mentor",
      title: t("mentor.title"),
      features: t.raw("mentor.features") as string[],
      image: "/assets/illustrations/signup/mentor.jpg",
      href: "#",
      soon: true,
      color: "border-gray-100",
    },
    {
      id: "teacher",
      title: t("teacher.title"),
      features: t.raw("teacher.features") as string[],
      image: "/assets/illustrations/signup/teacher.jpg",
      href: "#",
      soon: true,
      color: "border-gray-100",
    },
    {
      id: "provider",
      title: t("provider.title"),
      features: t.raw("provider.features") as string[],
      image: "/assets/illustrations/signup/provider.jpg",
      href: "#",
      soon: true,
      color: "border-gray-100",
    },
  ];

  return (
    <div className="min-h-screen py-10 flex flex-col items-center justify-center container mx-auto px-4 bg-white">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
          {t("greeting")}
        </h1>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-6xl space-y-8">
        {/* Top Row: 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {roles.slice(0, 3).map((role) => (
            <RoleCard key={role.id} role={role} t={t} />
          ))}
        </div>

        {/* Bottom Row: 2 cards centered */}
        <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8">
          {roles.slice(3).map((role) => (
            <div
              key={role.id}
              className="w-full md:w-[calc(33.333%-1.33rem)] max-w-sm mx-auto md:mx-0"
            >
              <RoleCard role={role} t={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-lg text-gray-500 font-medium">
          {t("have-account-footer")}{" "}
          <Link
            href="/sign-in"
            className="text-[#3b82f6] font-bold hover:underline"
          >
            {t("sign-in-footer")}
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({ role, t }: { role: any; t: any }) {
  const content = (
    <div
      className={cn(
        "relative flex flex-col items-center p-5 bg-white rounded-xl border transition-all duration-300 h-full",
        "border-gray/10 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.10)]",
        // Hover effects
        !role.soon &&
          "hover:border-transparent hover:shadow-[0_4px_6px_-1px_rgba(43,57,144,0.24)] hover:bg-linear-to-b hover:from-white hover:to-secondary-mint-green/24",
        role.soon && "cursor-default shadow-none opacity-80",
      )}
    >
      {/* Soon Ribbon */}
      {role.soon && (
        <div className="absolute top-0 left-0 overflow-hidden w-24 h-24 rounded-tl-[32px] pointer-events-none">
          <div className="absolute top-4 left-[-32px] w-32 py-1.5 bg-info text-white text-xs font-bold text-center -rotate-45 shadow-sm">
            {t(role.id + ".soon")}
          </div>
        </div>
      )}

      {/* Illustration */}
      <div className="mb-6 flex items-center justify-center w-full h-25">
        <Image
          src={role.image}
          alt={role.title}
          width={110}
          height={100}
          className="object-contain"
          // priority={false} // Removed priority to avoid LCP warnings on multiple images if needed
        />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold mb-4 mt-2 text-center text-primary">
        {role.title}
      </h3>

      {/* Features List */}
      <div className="space-y-3 w-full px-2">
        {role.features.map((feature: string, i: number) => (
          <div key={i} className="flex items-start gap-3 group">
            <div className="shrink-0 w-5 h-5 flex items-center justify-center mt-0.5">
              <Check className="w-4 h-4 text-success stroke-3" />
            </div>
            <span className="text-gray-500 text-sm font-medium leading-tight text-start">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (role.soon) {
    return content;
  }

  return (
    <Link href={role.href} className="block h-full group">
      {content}
    </Link>
  );
}
