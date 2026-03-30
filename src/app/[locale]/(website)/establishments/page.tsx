import { Metadata } from "next";
import Nurseries from "@/components/general/nurseries/Nurseries";
// import TopAdSection from "@/components/general/establishments/TopAdSection";
// import BottomAdSection from "@/components/general/establishments/BottomAdSection";
import { establishmentService, authService } from "@/services/api";
import { getCitiesAction, City } from "@/actions/getCitiesAction";

export const revalidate = 86400;

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise;
  return {
    title:
      params.locale === "ar"
        ? "First Step | المنشآت التعليمية - حضانات ومراكز في السعودية"
        : "First Step | Educational Establishments - Nurseries and Centers in Saudi Arabia",
    description:
      params.locale === "ar"
        ? "اكتشف أفضل المنشآت التعليمية في المملكة العربية السعودية. منصة First Step تسهل عليك العثور على حضانة أو مركز مناسب لطفلك حسب الموقع، الأسعار، والخدمات."
        : "Discover the best educational establishments in Saudi Arabia. First Step platform makes it easy to find the right nursery or center for your child based on location, prices, and services.",
  };
}

export default async function EstablishmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: "ar" | "en" }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const searchParameters = await searchParams;

  const query =
    typeof searchParameters.query === "string" ? searchParameters.query : "";
  const filter =
    typeof searchParameters.filter === "string" ? searchParameters.filter : "";

  // Extract filters from searchParams
  const city_ids = Array.isArray(searchParameters["city_ids[]"])
    ? (searchParameters["city_ids[]"] as string[])
    : searchParameters["city_ids[]"]
      ? [searchParameters["city_ids[]"] as string]
      : [];

  const category_service_ids = Array.isArray(
    searchParameters["category_service_ids[]"],
  )
    ? (searchParameters["category_service_ids[]"] as string[])
    : searchParameters["category_service_ids[]"]
      ? [searchParameters["category_service_ids[]"] as string]
      : [];

  let establishments: any[] = [];
  let cities: { id: string; label: string }[] = [];
  let categoryServices: { id: string; label: string }[] = [];
  let error = null;

  try {
    // Construct params for the API call
    const apiParams: { key: string; value: string }[] = [];
    if (query) apiParams.push({ key: "nursery_name", value: query });
    city_ids.forEach((id) => apiParams.push({ key: "city_ids[]", value: id }));
    category_service_ids.forEach((id) =>
      apiParams.push({ key: "category_service_ids[]", value: id }),
    );

    const [establishmentsData, citiesData, categoryServicesData] =
      await Promise.all([
        establishmentService.getEstablishments(locale, apiParams),
        getCitiesAction(),
        authService.getCategoryServices(),
      ]);

    // Show all establishments (nurseries and centers combined)
    establishments = establishmentsData as any[];

    // Transform cities for filter sidebar
    cities = (citiesData || []).map((city: City) => ({
      id: String(city.id),
      label: city.name?.[locale] || city.name?.ar || String(city.id),
    }));

    // Transform category services for filter sidebar
    categoryServices = (categoryServicesData || []).map((service: any) => ({
      id: String(service.id),
      label: service.name?.[locale] || service.name?.ar || String(service.id),
    }));
  } catch (err: any) {
    console.error("Error fetching data:", err);
    error = err;
  }

  console.log(establishments);

  return (
    <div>
      {/* Top Advertising Space - Two horizontal ads */}
      {/* <TopAdSection /> */}

      {/* Main Establishments Content */}
      <Nurseries
        nurseries={establishments}
        query={query}
        filter={filter}
        locale={locale}
        error={error}
        cities={cities}
        categoryServices={categoryServices}
      />

      {/* Bottom Advertising Space - Three ads in custom layout */}
      {/* <BottomAdSection /> */}
    </div>
  );
}
