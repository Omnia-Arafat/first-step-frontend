import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug, getAllCourses } from "@/data/courses";
import CourseDetailClient from "./_components/CourseDetailClient";

export const revalidate = 86400;

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise;
  const course = getCourseBySlug(params.courseId);

  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title:
      params.locale === "ar"
        ? `${course.name.ar} | دورات First Step`
        : `${course.name.en} | First Step Courses`,
    description: course.description[params.locale as "ar" | "en"]
      .split("\n")[0]
      .slice(0, 160),
  };
}

export async function generateStaticParams() {
  const courses = getAllCourses();
  return courses.map((course) => ({
    courseId: course.slug,
  }));
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: "ar" | "en"; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  const course = getCourseBySlug(courseId);

  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} locale={locale} />;
}
