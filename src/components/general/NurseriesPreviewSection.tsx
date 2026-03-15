import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NurseryCard from "@/components/general/nurseries/NurseryCard";
import { establishmentService } from "@/services/api";

const NurseriesPreviewSection = async ({
  locale,
}: {
  locale: "ar" | "en";
}) => {
  const t = await getTranslations("HomePage.NurseriesPreview");

  let nurseries: any[] = [];

  try {
    const data = await establishmentService.getEstablishments(locale);
    const all = Array.isArray(data) ? data : (data as any)?.data || [];
    nurseries = all.slice(0, 4);
  } catch {
    nurseries = [];
  }

  if (nurseries.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-primary-blue text-center mb-10">{t("title")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {nurseries.map((nursery, index) => (
          <NurseryCard key={index} nursery={nursery} locale={locale} />
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          href="/establishments"
          className="inline-flex items-center justify-center text-white font-semibold"
          style={{
            background:
              "linear-gradient(98.52deg, #7A8CFD 11.17%, #404FB1 63.74%, #2B3990 94.71%)",
            width: "320px",
            height: "48px",
            borderRadius: "8px",
            gap: "8px",
          }}
        >
          {t("viewAll")}
        </Link>
      </div>
    </section>
  );
};

export default NurseriesPreviewSection;
