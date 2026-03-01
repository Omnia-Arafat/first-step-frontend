import { Metadata } from "next";
import { Locale, makePageMetadata } from "@/lib/metadata";
import { getLocale } from "next-intl/server";
import CenterAdRequest from "@/components/forms/dashboard/adblog-request/CenterAdRequest";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return makePageMetadata(
    locale as Locale,
    "dashboard/nursery/ad-or-blog-request/ad-request",
  );
}

export default function CenterAdRequestPage() {
  const t = useTranslations("dashboard.center.ad-or-blog-request.ad");

  return (
    <div>
      <div className="py-2.5 text-center bg-secondary-mint-green rounded-t-full font-medium">
        {t("free-notice", { type: t("nursery") })}
      </div>

      <div className="p-10 flex flex-col gap-y-4">
        <div className="space-y-2">
          <p className="heading-4 font-medium text-primary">{t("title")}</p>
          <p className="text-mid-gray">{t("description")}</p>
        </div>

        <CenterAdRequest />
      </div>
    </div>
  );
}
