"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/dashboardApi";
import DashboardBlogCard from "@/components/dashboard/blog/DashboardBlogCard";
import BlogViewModal from "@/components/dashboard/blog/BlogViewModal";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Blog } from "@/types";
import EmptyState from "@/components/common/EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const AdminBlogs = () => {
  const t = useTranslations("dashboard.admin.blog");
  const locale = useLocale();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminBlogs", page],
    queryFn: () => adminService.getBlogs(page),
  });

  const deleteMutation = useMutation({
    mutationFn: (blogId: string) => adminService.deleteBlog(blogId),
    onSuccess: () => {
      toastSuccess(t("delete.success"));
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    },
    onError: () => {
      toastError(t("delete.error"));
    },
  });

  const handleDelete = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (blogToDelete) {
      deleteMutation.mutate(blogToDelete.id.toString());
    }
  };

  if (error) return <div className="text-red-500">{t("error")}</div>;

  // Extract blogs array from paginated response
  const blogs = data?.data || [];

  // Map blogs to the shape DashboardBlogCard expects
  const mappedBlogs = blogs.map((blog: any) => ({
    ...blog,
    title: typeof blog.title === "object" ? blog.title?.[locale] : blog.title,
    description:
      typeof blog.description === "object"
        ? blog.description?.[locale]
        : blog.description,
    content:
      typeof blog.content === "object" ? blog.content?.[locale] : blog.content,
  }));

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button asChild>
          <Link href="blog/add">{t("addBlog")}</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-3 items-start gap-10">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white shadow-card min-w-60 p-2 pb-4 flex flex-col items-start gap-y-2 rounded-2xl"
            >
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="w-full flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : mappedBlogs.length === 0 ? (
        <EmptyState
          icon="📝"
          size="lg"
          primaryAction={{
            label: t("addBlog"),
            onClick: () => {
              router.push("/dashboard/admin/blog/add");
            },
          }}
          translationKey="dashboard.emptyStates.blogs"
        />
      ) : (
        <>
          <div className="grid lg:grid-cols-3 items-start gap-10">
            {mappedBlogs.map((blog: any) => (
              <DashboardBlogCard
                key={blog.id}
                blog={blog}
                onView={() => {
                  setSelectedBlog(blog);
                  setViewModalOpen(true);
                }}
                onEdit={() => router.push(`blog/${blog.id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.last_page > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                {locale === "ar" ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
              <span className="text-sm font-medium">
                {t("page")} {page} {t("of")} {data.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.meta.last_page}
                onClick={() => setPage((prev) => prev + 1)}
              >
                {locale === "ar" ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </>
      )}

      <BlogViewModal
        blog={selectedBlog}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        isAdmin={true}
      />

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title={t("delete.title")}
        description={t("delete.description")}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminBlogs;
