"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/dashboardApi";
import AdminBlogCard from "@/components/general/blog/AdminBlogCard";
import { useTranslations } from "next-intl";
import { toastSuccess, toastError } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

function BlogCardSkeleton({ showActions = false }: { showActions?: boolean }) {
  return (
    <div className="bg-white shadow-card min-w-60 p-2 pb-4 flex flex-col items-start gap-y-2 rounded-2xl relative">
      <div className="w-full h-40 rounded-xl overflow-hidden relative">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="w-full space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-auto w-full flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      {showActions && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/55 backdrop-blur-[1px] gap-y-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      )}
    </div>
  );
}

function CenterBlogsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64 mx-auto" />
      <div className="flex flex-col gap-y-12">
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((__, cardIndex) => (
                <BlogCardSkeleton
                  key={cardIndex}
                  showActions={sectionIndex !== 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CenterBlogsPage({
  params,
}: {
  params: Promise<{ centerId: string }>;
}) {
  const meta = usePageMetadata();

  const t = useTranslations("dashboard.admin.blog.center");
  const { centerId } = use(params);
  const queryClient = useQueryClient();
  const {
    data: blogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["centerBlogs", centerId],
    queryFn: () => adminService.getOneCenterBlogs(centerId),
  });

  const { mutate: approveBlog, isPending: isApproving } = useMutation({
    mutationFn: (blogId: string) => adminService.approveCenterBlog(blogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centerBlogs", centerId] });
      toastSuccess(t("blogApproved"));
    },
    onError: (error) => {
      console.error("Error approving blog:", error);
      toastError(t("approvalError"));
    },
  });

  const { mutate: rejectBlog, isPending: isRejecting } = useMutation({
    mutationFn: (blogId: string) => adminService.rejectCenterBlog(blogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centerBlogs", centerId] });
      toastSuccess(t("blogRejected"));
    },
    onError: (error) => {
      console.error("Error rejecting blog:", error);
      toastError(t("rejectionError"));
    },
  });

  const handleAccept = (blogId: string) => {
    approveBlog(blogId);
  };

  const handleReject = (blogId: string) => {
    rejectBlog(blogId);
  };

  const isLoadingAction = isApproving || isRejecting;

  if (isLoading) return <CenterBlogsSkeleton />;
  if (error) return <div className="text-red-500">{t("error")}</div>;

  // Helper to map backend blog to AdminBlogCard props
  const mapBlogToCard = (blog: any) => ({
    id: blog.id,
    title: blog.title || t("noTitle"),
    description: blog.description,
    image: blog.blog_image_url,
    published_at: blog.created_at.split(" ")[0],
    reading_time: blog.reading_time,
    status: blog.status,
  });

  return (
    <div className="space-y-4">
      <h1 className="heading-4 text-primary font-medium text-center">
        {t("center")}
      </h1>
      <div className="flex flex-col gap-y-12">
        <div className="space-y-4">
          <p className="heading-4 text-primary font-medium">
            {t("pendingBlogs")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs
              .map(mapBlogToCard)
              .filter((blog: any) => blog.status === "pending")
              .map((blog: any) => (
                <AdminBlogCard
                  key={blog.id}
                  blog={blog}
                  onAccept={() => handleAccept(blog.id)}
                  onReject={() => handleReject(blog.id)}
                  loading={isLoadingAction}
                />
              ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="heading-4 text-primary font-medium">
            {t("acceptedBlogs")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs
              .map(mapBlogToCard)
              .filter((blog: any) => blog.status === "approved")
              .map((blog: any) => (
                <AdminBlogCard key={blog.id} blog={blog} />
              ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="heading-4 text-primary font-medium">
            {t("rejectedBlogs")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs
              .map(mapBlogToCard)
              .filter((blog: any) => blog.status === "rejected")
              .map((blog: any) => (
                <AdminBlogCard
                  key={blog.id}
                  blog={blog}
                  onAccept={() => handleAccept(blog.id)}
                  loading={isLoadingAction}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
