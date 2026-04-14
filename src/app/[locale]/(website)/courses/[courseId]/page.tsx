import { Metadata } from "next";
import { notFound } from "next/navigation";
import { courseService } from "@/services/api";
import CourseDetailClient from "./_components/CourseDetailClient";

export const revalidate = 3600;

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}): Promise<Metadata> {
  const { locale, courseId } = await paramsPromise;
  try {
    const course = await courseService.getCourseById(courseId);
    return {
      title:
        locale === "ar"
          ? `${course.title} | دورات First Step`
          : `${course.title} | First Step Courses`,
      description: course.description.slice(0, 160),
    };
  } catch {
    return { title: "Course Not Found" };
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: "ar" | "en"; courseId: string }>;
}) {
  const { locale, courseId } = await params;

  let course;
  try {
    course = await courseService.getCourseById(courseId);
  } catch {
    notFound();
  }

  return <CourseDetailClient course={course} locale={locale} />;
}
