"use client";

import { use } from "react";
import CourseEditForm from "@/components/dashboard/courses/CourseEditForm";

export default function CourseEditPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  return <CourseEditForm courseId={id} />;
}
