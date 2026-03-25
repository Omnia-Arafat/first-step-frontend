"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService, type Quiz } from "@/services/quizService";
import CourseCard from "./CourseCard";
import StatsCards from "./StatsCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { Plus, Search, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useTranslations } from "next-intl";
import { toastSuccess, toastError } from "@/lib/toast";
import Image from "next/image";

type StatusFilter = "all" | "published" | "draft";
type SortOption = "newest" | "oldest" | "title";

const CoursesListing = () => {
  const t = useTranslations("dashboard.admin-courses.listing");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Quiz | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizService.delete(id),
    onSuccess: () => {
      toastSuccess(t("delete.success"));
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: () => {
      toastError(t("delete.error"));
    },
  });

  const courses: Quiz[] = data?.data || [];

  // Compute stats
  const stats = useMemo(() => {
    const published = courses.filter(
      (c: Quiz) => c.status === "published",
    ).length;
    const draft = courses.filter(
      (c: Quiz) => c.status !== "published",
    ).length;
    const totalViews = courses.reduce(
      (sum: number, c: Quiz) => sum + (c.views_count || 0),
      0,
    );
    return {
      totalCourses: courses.length,
      published,
      draft,
      totalViews,
    };
  }, [courses]);

  // Filter & sort
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c: Quiz) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (statusFilter === "published") {
      result = result.filter((c: Quiz) => c.status === "published");
    } else if (statusFilter === "draft") {
      result = result.filter((c: Quiz) => c.status !== "published");
    }

    // Sort
    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime(),
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at || "").getTime() -
          new Date(b.created_at || "").getTime(),
      );
    } else if (sortBy === "title") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || "", "ar"));
    }

    return result;
  }, [courses, searchQuery, statusFilter, sortBy]);

  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        {t("error")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-end">
        <Button asChild className="gap-2">
          <Link href="/dashboard/admin/courses/add">
            <Plus className="w-4 h-4" />
            {t("addNew")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsCards {...stats} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 text-start"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-start appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">{t("filters.status")}</option>
              <option value="published">{t("filters.published")}</option>
              <option value="draft">{t("filters.draft")}</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Age Group (visual placeholder – API doesn't have age group filter) */}
          <div className="relative">
            <select
              className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-start appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              defaultValue=""
            >
              <option value="">{t("filters.ageGroup")}</option>
              <option value="3-7">{t("filters.ageGroup_3_7")}</option>
              <option value="7-12">{t("filters.ageGroup_7_12")}</option>
              <option value="12-18">{t("filters.ageGroup_12_18")}</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-start appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="newest">{t("filters.sortBy")}</option>
              <option value="newest">{t("filters.newest")}</option>
              <option value="oldest">{t("filters.oldest")}</option>
              <option value="title">{t("filters.title")}</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-2 pb-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center gap-6">
          <div className="w-36 h-36 rounded-full bg-gray-50 flex items-center justify-center">
            <Image
              src="/assets/illustrations/book.png"
              alt={t("empty.title")}
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              {t("empty.title")}
            </h3>
            <p className="text-gray-500 text-sm max-w-md">
              {t("empty.description")}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/dashboard/admin/courses/add">
              <Plus className="w-4 h-4" />
              {t("empty.cta")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Quiz) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() =>
                router.push(`/dashboard/admin/courses/${course.id}`)
              }
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          if (courseToDelete) deleteMutation.mutate(courseToDelete.id);
        }}
        title={t("delete.title")}
        description={t("delete.description")}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CoursesListing;
