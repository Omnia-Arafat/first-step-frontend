import { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getAllCourses } from "@/data/courses";
import { Button } from "@/components/ui/button";

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
        ? "دورات First Step | دورات تعليمية متخصصة عبر الإنترنت"
        : "First Step Courses | Specialized Online Educational Courses",
    description:
      params.locale === "ar"
        ? "استكشف دوراتنا التعليمية المتخصصة عبر الإنترنت وسجّل اليوم لتطوير مهاراتك."
        : "Explore our specialized online courses and enroll today to develop your skills.",
  };
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: "ar" | "en" }>;
}) {
  const { locale } = await params;
  const courses = getAllCourses();

  return (
    <main>
      <CoursesContent locale={locale} courses={courses} />
    </main>
  );
}

function CoursesContent({
  locale,
  courses,
}: {
  locale: "ar" | "en";
  courses: ReturnType<typeof getAllCourses>;
}) {
  const t = useTranslations("courses");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-linear-to-b from-primary-blue-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-blue mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-lg md:text-xl text-mid-gray max-w-2xl mx-auto">
            {t("pageSubtitle")}
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        {courses.length === 0 ? (
          <p className="text-center text-mid-gray text-lg">{t("noCourses")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-card hover:shadow-subtle transition-all duration-300"
              >
                {/* Course Image */}
                <div className="relative w-full h-48 md:h-56 bg-linear-to-br from-primary-blue to-primary-blue-400">
                  {/* Fallback with course initial (visible if image fails) */}
                  <div className="absolute inset-0 flex items-center justify-center text-white z-0">
                    <span className="text-4xl font-bold">
                      {course.name[locale].charAt(0)}
                    </span>
                  </div>
                  <Image
                    src={course.image}
                    alt={course.name[locale]}
                    fill
                    className="object-cover relative z-10"
                  />
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-blue mb-3 group-hover:text-primary-blue-400 transition-colors">
                    {course.name[locale]}
                  </h3>
                  <p className="text-gray text-sm leading-relaxed mb-4 line-clamp-3">
                    {course.description[locale].split("\n")[0]}
                  </p>

                  {/* Duration & Price badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="inline-block bg-primary-green-50 text-primary-green-700 text-xs font-medium px-3 py-1 rounded-full">
                      {course.duration[locale].split("\n")[0]}
                    </span>
                    <span className="inline-block bg-primary-blue-50 text-primary-blue text-xs font-medium px-3 py-1 rounded-full">
                      {course.price[locale]}
                    </span>
                  </div>

                  <Button asChild size="sm" className="w-full">
                    <Link href={`/courses/${course.slug}`}>
                      {t("viewDetails")}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
