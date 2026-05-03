"use client";

import { use } from "react";
import CourseDetail from "@/components/dashboard/courses/CourseDetail";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  return <CourseDetail courseId={id} />;
}
