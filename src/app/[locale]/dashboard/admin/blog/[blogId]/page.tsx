"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminBlogRequestFormData } from "@/lib/schemas";
import { adminService } from "@/services/dashboardApi";
import AdminBlogForm from "@/components/forms/dashboard/blog/AdminBlogForm";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

function AdminBlogDetailsSkeleton() {
  return (
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
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="sm:col-span-2 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="sm:col-span-2 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="sm:col-span-2 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="sm:col-span-4 flex justify-end">
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export default function BlogDetails({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const meta = usePageMetadata();

  const t = useTranslations("dashboard.admin.blog.details");
  const { blogId } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["blog", blogId],
    queryFn: () => adminService.getBlog(blogId),
    enabled: !!blogId,
  });

  const router = useRouter();

  if (isLoading) return <AdminBlogDetailsSkeleton />;
  if (error) return <div className="text-red-500">{t("error")}</div>;
  if (!data) return null;

  // Map API response to AdminBlogRequestFormData
  const initialValues: AdminBlogRequestFormData = {
    title: data.title,
    description: data.description,
    content: data.content,
    mainImage: data.file,
    cardImage: data.image,
  };

  return (
    <AdminBlogForm
      initialValues={initialValues}
      readOnly
      onCancel={() => router.back()}
    />
  );
}
