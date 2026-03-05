"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { centerService } from "@/services/dashboardApi";
import CenterBlogForm from "@/components/forms/dashboard/adblog-request/CenterBlogForm";
import { useTranslations, useLocale } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

function CenterBlogEditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-3.5 flex items-center justify-between">
        <Skeleton className="h-10 w-64 mx-auto" />
      </div>
      <div className="grid sm:grid-cols-4 items-start gap-4">
        <div className="sm:col-span-3 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="aspect-[1440/610] w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="aspect-[264/160] w-full rounded-xl" />
        </div>
        <div className="sm:col-span-2 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="sm:col-span-2 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="sm:col-span-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="sm:col-span-4 flex justify-end gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function CenterBlogEdit({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const meta = usePageMetadata();

  const t = useTranslations("dashboard.center.ad-or-blog-request.blog.edit");
  const locale = useLocale();
  const { blogId } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["blog", blogId],
    queryFn: () => centerService.getBlog(blogId),
    enabled: !!blogId,
  });

  if (isLoading) return <CenterBlogEditSkeleton />;
  if (error) return <div className="text-red-500">{t("errorLoading")}</div>;
  if (!data) return null;

  // Map API response to form data
  const initialValues = {
    title:
      typeof data.title === "string" ? data.title : data.title?.[locale] || "",
    description:
      typeof data.description === "string"
        ? data.description
        : data.description?.[locale] || "",
    content:
      typeof data.content === "string"
        ? data.content
        : data.content?.[locale] || "",
    mainImageUrl: data.cover_url || data.file,
    cardImageUrl: data.blog_image_url || data.image,
  };

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="heading-4 font-bold text-primary max-w-159 mx-auto">
          {t("pageTitle")}
        </h1>
      </div>

      <CenterBlogForm initialValues={initialValues} blogId={blogId} />
    </div>
  );
}
