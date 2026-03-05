"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { use } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminBlogRequestFormData } from "@/lib/schemas";
import { adminService } from "@/services/dashboardApi";
import AdminBlogForm from "@/components/forms/dashboard/blog/AdminBlogForm";
import { toastSuccess, toastError } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

function AdminBlogEditSkeleton() {
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

export default function BlogEdit({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const meta = usePageMetadata();

  const t = useTranslations("dashboard.admin.blog.edit");
  const { blogId } = use(params);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminBlogs", blogId],
    queryFn: () => adminService.getBlog(blogId),
    enabled: !!blogId,
  });

  const mutation = useMutation({
    mutationFn: async (payload: Partial<AdminBlogRequestFormData>) => {
      await adminService.updateBlog(blogId, {
        titleAr: payload.title?.ar,
        titleEn: payload.title?.en,
        descriptionAr: payload.description?.ar,
        descriptionEn: payload.description?.en,
        contentAr: payload.content?.ar,
        contentEn: payload.content?.en,
        mainImage: payload.mainImage?.[0] as File,
        cardImage: payload.cardImage?.[0] as File,
      });
    },
    onSuccess: () => {
      toastSuccess(t("success"));
      queryClient.refetchQueries({ queryKey: ["adminBlogs", blogId] });
    },
    onError: () => {
      toastError(t("error"));
    },
  });

  const router = useRouter();

  if (isLoading) return <AdminBlogEditSkeleton />;
  if (error) return <div className="text-red-500">{t("fetchError")}</div>;
  if (!data) return null;

  // Map API response to AdminBlogRequestFormData
  const initialValues: AdminBlogRequestFormData = {
    title: data.title,
    description: data.description,
    content: data.content,
    mainImage: data.file,
    cardImage: data.image,
  };

  // Handler to collect dirty fields and only send those
  const handleSubmit = (data: AdminBlogRequestFormData, dirtyFields: any) => {
    const payload: Partial<AdminBlogRequestFormData> = {};
    payload.title = {
      ar: dirtyFields.title?.ar ? data.title.ar : initialValues.title.ar,
      en: dirtyFields.title?.en ? data.title.en : initialValues.title.en,
    };
    payload.description = {
      ar: dirtyFields.description?.ar
        ? data.description.ar
        : initialValues.description.ar,
      en: dirtyFields.description?.en
        ? data.description.en
        : initialValues.description.en,
    };
    payload.content = {
      ar: dirtyFields.content?.ar ? data.content.ar : initialValues.content.ar,
      en: dirtyFields.content?.en ? data.content.en : initialValues.content.en,
    };
    if (dirtyFields.mainImage) payload.mainImage = data.mainImage;
    if (dirtyFields.cardImage) payload.cardImage = data.cardImage;
    mutation.mutate(payload);
  };

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="heading-4 font-bold text-primary max-w-159 mx-auto">
          {t("title")}
        </h1>
      </div>
      <AdminBlogForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={mutation.isPending}
        onCancel={() => router.back()}
      />
    </div>
  );
}
