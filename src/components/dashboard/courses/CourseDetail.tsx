"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService, type Quiz, type Partition } from "@/services/quizService";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  Archive,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Clock,
  BookOpen,
  Users,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toastSuccess, toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface CourseDetailProps {
  courseId: string;
}

const CourseDetail = ({ courseId }: CourseDetailProps) => {
  const t = useTranslations("dashboard.admin-courses.detail");
  const tShared = useTranslations("dashboard.admin-courses");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["quiz", courseId],
    queryFn: () => quizService.getOne(courseId),
    enabled: !!courseId,
  });

  const { data: statsData } = useQuery({
    queryKey: ["quiz-stats", courseId],
    queryFn: () => quizService.getCompletedCount(courseId),
    enabled: !!courseId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => quizService.delete(courseId),
    onSuccess: () => {
      toastSuccess(t("toasts.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      router.push("/dashboard/admin/courses");
    },
    onError: () => {
      toastError(t("toasts.deleteError"));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => quizService.archive(courseId),
    onSuccess: () => {
      toastSuccess(t("toasts.archiveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["quiz", courseId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setArchiveDialogOpen(false);
    },
    onError: () => {
      toastError(t("toasts.archiveError"));
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => quizService.publish(courseId),
    onSuccess: () => {
      toastSuccess(t("toasts.publishSuccess"));
      queryClient.invalidateQueries({ queryKey: ["quiz", courseId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    onError: () => {
      toastError(t("toasts.publishError"));
    },
  });

  const quiz: Quiz | null = data?.data || null;
  const stats = statsData?.data || { total_attempts: 0, completed_count: 0 };

  const completionRate =
    stats.total_attempts > 0
      ? Math.round((stats.completed_count / stats.total_attempts) * 100)
      : 0;

  const avgScore =
    stats.average_score !== undefined
      ? Math.round(Number(stats.average_score))
      : stats.avg_score !== undefined
        ? Math.round(Number(stats.avg_score))
        : 0;

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ar-SA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-20 text-red-500">
        {t("toasts.loadError")}
      </div>
    );
  }

  const isPublished = quiz.status === "published";
  const partitions = quiz.content?.partitions || [];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/admin/courses")}
          className="gap-2"
        >
          {t("backButton")}
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <h1 className="text-2xl font-bold text-gray-900">{t("pageTitle")}</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-start">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          {t("actions.delete")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/dashboard/admin/courses/${courseId}/edit`)
          }
          className="gap-1.5"
        >
          <Edit className="w-4 h-4" />
          {t("actions.edit")}
        </Button>

        <Button
          variant={isPublished ? "outline" : "default"}
          size="sm"
          onClick={() => {
            if (isPublished) {
              setArchiveDialogOpen(true);
            } else {
              publishMutation.mutate();
            }
          }}
          disabled={publishMutation.isPending || archiveMutation.isPending}
          className="gap-1.5"
        >
          {isPublished ? (
            <>
              <Archive className="w-4 h-4" />
              {t("actions.archive")}
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              {t("actions.publish")}
            </>
          )}
        </Button>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-card">
        <div className="relative h-64">
          {quiz.image ? (
            <Image
              src={quiz.image}
              alt={quiz.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-primary/40" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-4 start-4">
            <span
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold",
                isPublished
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-400 text-amber-900",
              )}
            >
              {isPublished ? t("status.published") : t("status.draft")}
            </span>
          </div>

          {/* Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/70 to-transparent p-6">
            <h2 className="text-xl font-bold text-white mb-1">{quiz.title}</h2>
            <p className="text-sm text-white/80 line-clamp-2">
              {quiz.description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-white/70">
              {quiz.reading_time && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {quiz.reading_time} {t("status.readings")}
                  </span>
                </div>
              )}
              {quiz.from && quiz.to && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {t("status.ageRange", { from: quiz.from, to: quiz.to })}
                  </span>
                </div>
              )}
              {quiz.views_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t("status.views", { count: quiz.views_count })}</span>
                </div>
              )}
            </div>
            {quiz.updated_at && (
              <div className="flex items-center gap-1 mt-2 text-xs text-white/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(quiz.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500">{t("stats.completedUsers")}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {quiz.views_count || 0}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {t("stats.completedUsersNote")}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-xs text-gray-500">{t("stats.completionRate")}</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {completionRate}%
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {t("stats.completionRateNote")}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs text-gray-500">{t("stats.avgScore")}</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{avgScore}%</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {t("stats.avgScoreNote")}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500">{t("stats.lastModified")}</p>
          <p className="text-[10px] text-gray-400 mt-3">
            {formatDate(quiz.updated_at)}
          </p>
        </div>
      </div>

      {/* Content Sections */}
      {partitions.length > 0 && (
        <div className="flex flex-col gap-4">
          {partitions.map((partition: Partition, index: number) => {
            const isExpanded = expandedSections[partition.id] !== false;
            const points = partition["partitions-points"] || [];
            const questions = partition.questions || [];

            return (
              <div
                key={partition.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(partition.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-1 text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-start">
                    <h3 className="font-bold text-gray-900">
                      {t("content.sectionLabel", { n: index + 1 })}:{" "}
                      {partition.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t("content.pointsCount", { count: points.length })} -{" "}
                      {t("content.questionsCount", { count: questions.length })}
                    </p>
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 flex flex-col gap-6">
                    {/* Section Title & Points */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 text-start">
                        {t("content.sectionTitle")}
                      </h4>
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1 text-start">
                          {tShared("edit.sections.sectionTitleLabel")}
                        </label>
                        <div className="bg-gray-50 rounded-md px-3 py-2 text-sm text-start text-gray-700">
                          {partition.name}
                        </div>
                      </div>

                      {/* Points List */}
                      <div className="flex flex-col gap-2 mt-3">
                        {points.map((point) => (
                          <div
                            key={point.id}
                            className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 text-sm text-start text-gray-700"
                          >
                            <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                            {point.point}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Questions */}
                    {questions.map((question, qIndex) => (
                      <div
                        key={question.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-3 justify-start">
                          <span className="bg-primary text-white px-3 py-0.5 rounded-full text-xs font-semibold">
                            {t("content.questionLabel", { n: qIndex + 1 })}
                          </span>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs text-gray-500 mb-1 text-start">
                            {t("content.questionText")}
                          </label>
                          <div className="bg-white rounded-md px-3 py-2 text-sm text-start text-gray-700 border border-gray-200">
                            {question.title}
                          </div>
                        </div>

                        {/* Choices */}
                        {question.type === "multiple_choice" &&
                          question.choices?.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                              {question.choices.map((choice, cIndex) => (
                                <div
                                  key={choice.id}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm border",
                                    Number(choice.is_correct) === 1
                                      ? "border-emerald-300 bg-emerald-50"
                                      : "border-gray-200 bg-white",
                                  )}
                                >
                                  <span className="text-start flex-1">
                                    {choice.choice_text}
                                  </span>
                                  <span
                                    className={cn(
                                      "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                                      Number(choice.is_correct) === 1
                                        ? "bg-emerald-500 text-white"
                                        : "bg-gray-200 text-gray-500",
                                    )}
                                  >
                                    {cIndex + 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title={t("dialogs.deleteTitle")}
        description={t("dialogs.deleteDescription")}
        isLoading={deleteMutation.isPending}
      />

      {/* Archive Confirmation */}
      <ConfirmationDialog
        isOpen={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={() => archiveMutation.mutate()}
        title={t("dialogs.archiveTitle")}
        description={t("dialogs.archiveDescription")}
        isLoading={archiveMutation.isPending}
        variant="default"
      />
    </div>
  );
};

export default CourseDetail;
