"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  quizService,
  type Quiz,
  type Partition,
  type PartitionPoint,
  type Question,
  type Choice,
} from "@/services/quizService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface CourseEditFormProps {
  courseId: string;
}

// ── Local state types (pre-populated from API) ────────────────────────────────

interface LocalChoice {
  id?: number;
  text: string;
  isCorrect: boolean;
  isDeleted?: boolean;
}

interface LocalQuestion {
  id?: number;
  text: string;
  type: "text" | "multiple_choice";
  choices: LocalChoice[];
  isDeleted?: boolean;
}

interface LocalPoint {
  id?: number;
  text: string;
  isDeleted?: boolean;
}

interface LocalSection {
  id?: number;
  name: string;
  points: LocalPoint[];
  questions: LocalQuestion[];
  isNew?: boolean;
  isSaving?: boolean;
}

interface LocalCardInfo {
  title: string;
  description: string;
  readingTime: string;
  ageFrom: string;
  ageTo: string;
  image: File | null;
  imagePreview: string | null;
  existingImageUrl?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const mapApiToLocal = (quiz: Quiz): { cardInfo: LocalCardInfo; sections: LocalSection[]; mainContent: string } => {
  const cardInfo: LocalCardInfo = {
    title: quiz.title || "",
    description: quiz.description || "",
    readingTime: quiz.reading_time || "",
    ageFrom: quiz.from || "",
    ageTo: quiz.to || "",
    image: null,
    imagePreview: null,
    existingImageUrl: quiz.image,
  };

  const mainContent = quiz.content?.description || "";

  const sections: LocalSection[] =
    quiz.content?.partitions?.map((p: Partition) => ({
      id: p.id,
      name: p.name,
      points: p["partitions-points"]?.map((pt: PartitionPoint) => ({
        id: pt.id,
        text: pt.point,
      })) || [],
      questions: p.questions?.map((q: Question) => ({
        id: q.id,
        text: q.title,
        type: q.type,
        choices: q.choices?.map((c: Choice) => ({
          id: c.id,
          text: c.choice_text,
          isCorrect: Number(c.is_correct) === 1,
        })) || [],
      })) || [],
    })) || [];

  return { cardInfo, sections, mainContent };
};

// ── Component ────────────────────────────────────────────────────────────────

const CourseEditForm = ({ courseId }: CourseEditFormProps) => {
  const t = useTranslations("dashboard.admin-courses.edit");
  const tShared = useTranslations("dashboard.admin-courses");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [cardInfo, setCardInfo] = useState<LocalCardInfo>({
    title: "",
    description: "",
    readingTime: "",
    ageFrom: "",
    ageTo: "",
    image: null,
    imagePreview: null,
  });
  const [sections, setSections] = useState<LocalSection[]>([]);
  const [mainContent, setMainContent] = useState("");
  const [contentId, setContentId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [deletePointDialog, setDeletePointDialog] = useState<{ sectionIdx: number; pointIdx: number } | null>(null);
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState<{ sectionIdx: number; questionIdx: number } | null>(null);
  const [deleteSectionDialog, setDeleteSectionDialog] = useState<number | null>(null);

  // ── Fetch quiz data ──────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: ["quiz", courseId],
    queryFn: () => quizService.getOne(courseId),
    enabled: !!courseId,
  });

  useEffect(() => {
    if (data?.data && !isInitialized) {
      const quiz = data.data as Quiz;
      const mapped = mapApiToLocal(quiz);
      setCardInfo(mapped.cardInfo);
      setSections(mapped.sections);
      setMainContent(mapped.mainContent);
      setContentId(quiz.content?.id || null);
      setIsInitialized(true);
    }
  }, [data, isInitialized]);

  // ── Image handling ───────────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toastError(t("toasts.imageSizeError"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCardInfo((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // ── Save Card Info ────────────────────────────────────────────────────────

  const handleSaveCardInfo = async () => {
    if (!cardInfo.title.trim()) {
      toastError(t("toasts.cardTitleRequired"));
      return;
    }
    setIsSavingCard(true);
    try {
      await quizService.update(courseId, {
        quiz_title: cardInfo.title,
        description: cardInfo.description,
        reading_time: cardInfo.readingTime,
        from: cardInfo.ageFrom,
        to: cardInfo.ageTo,
        ...(cardInfo.image ? { image: cardInfo.image } : {}),
      });
      toastSuccess(t("toasts.cardSuccess"));
      queryClient.invalidateQueries({ queryKey: ["quiz", courseId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    } catch (error: any) {
      toastError(error?.message || t("toasts.cardError"));
    } finally {
      setIsSavingCard(false);
    }
  };

  // ── Save Section (partition) ──────────────────────────────────────────────

  const handleSaveSection = async (sectionIndex: number) => {
    const section = sections[sectionIndex];
    if (!section.name.trim()) {
      toastError(t("toasts.sectionTitleRequired"));
      return;
    }

    setSections((prev) =>
      prev.map((s, i) => (i === sectionIndex ? { ...s, isSaving: true } : s)),
    );

    try {
      if (section.isNew || !section.id) {
        // New section — create partition then points & questions
        if (!contentId) {
          // Create content first if it doesn't exist
          const contentResult = await quizService.createContent({
            quiz_id: courseId,
            content_description: mainContent,
          });
          setContentId(contentResult.id);
        }

        const partitionResult = await quizService.createPartition({
          quiz_content_id: String(contentId),
          name: section.name,
        });
        const partitionId = partitionResult.data?.id;

        // Create points
        for (const point of section.points) {
          if (!point.text.trim()) continue;
          await quizService.createPoint({
            partition_id: String(partitionId),
            point: point.text,
          });
        }

        // Create questions
        for (const question of section.questions) {
          if (!question.text.trim()) continue;
          const questionResult = await quizService.createQuestion({
            partition_id: String(partitionId),
            type: question.type,
            question_title: question.text,
          });
          const questionId = questionResult.data?.id;
          if (!questionId) continue;
          if (question.type === "multiple_choice") {
            for (const choice of question.choices) {
              if (!choice.text.trim()) continue;
              await quizService.createChoice({
                question_id: String(questionId),
                choice_text: choice.text,
                is_correct: choice.isCorrect ? "1" : "0",
              });
            }
          }
        }

        toastSuccess(t("toasts.sectionAddSuccess"));
        // Refresh to get server IDs
        queryClient.invalidateQueries({ queryKey: ["quiz", courseId] });
        setIsInitialized(false);
      } else {
        // Update existing partition name
        await quizService.updatePartition(section.id, { name: section.name });

        // Update existing points
        for (const point of section.points) {
          if (!point.text.trim()) continue;
          if (point.id) {
            await quizService.updatePoint(point.id, { point: point.text });
          } else {
            // New point added to existing section
            await quizService.createPoint({
              partition_id: String(section.id),
              point: point.text,
            });
          }
        }

        // Update existing questions
        for (const question of section.questions) {
          if (!question.text.trim()) continue;
          if (question.id) {
            await quizService.updateQuestion(question.id, {
              question_title: question.text,
              type: question.type,
            });
            // Update choices
            for (const choice of question.choices) {
              if (!choice.text.trim()) continue;
              if (choice.id) {
                await quizService.updateChoice(choice.id, {
                  choice_text: choice.text,
                  is_correct: choice.isCorrect ? "1" : "0",
                });
              } else {
                await quizService.createChoice({
                  question_id: String(question.id),
                  choice_text: choice.text,
                  is_correct: choice.isCorrect ? "1" : "0",
                });
              }
            }
          } else {
            // New question in existing section
            const questionResult = await quizService.createQuestion({
              partition_id: String(section.id),
              type: question.type,
              question_title: question.text,
            });
            const questionId = questionResult.data?.id;
            if (questionId && question.type === "multiple_choice") {
              for (const choice of question.choices) {
                if (!choice.text.trim()) continue;
                await quizService.createChoice({
                  question_id: String(questionId),
                  choice_text: choice.text,
                  is_correct: choice.isCorrect ? "1" : "0",
                });
              }
            }
          }
        }

        toastSuccess(t("toasts.sectionUpdateSuccess"));
        queryClient.invalidateQueries({ queryKey: ["quiz", courseId] });
        setIsInitialized(false);
      }
    } catch (error: any) {
      toastError(error?.message || t("toasts.sectionError"));
    } finally {
      setSections((prev) =>
        prev.map((s, i) => (i === sectionIndex ? { ...s, isSaving: false } : s)),
      );
    }
  };

  // ── Delete Section ────────────────────────────────────────────────────────

  const handleDeleteSection = async (sectionIndex: number) => {
    const section = sections[sectionIndex];
    try {
      if (section.id) {
        await quizService.deletePartition(section.id);
        toastSuccess(t("toasts.deleteSection"));
        queryClient.invalidateQueries({ queryKey: ["quiz", courseId] });
        setIsInitialized(false);
      } else {
        // Local only - just remove
        setSections((prev) => prev.filter((_, i) => i !== sectionIndex));
      }
    } catch (error: any) {
      toastError(error?.message || t("toasts.deleteSectionError"));
    } finally {
      setDeleteSectionDialog(null);
    }
  };

  // ── Delete Point ─────────────────────────────────────────────────────────

  const handleDeletePoint = async (sectionIdx: number, pointIdx: number) => {
    const point = sections[sectionIdx].points[pointIdx];
    try {
      if (point.id) {
        await quizService.deletePoint(point.id);
        toastSuccess(t("toasts.deletePoint"));
      }
      setSections((prev) =>
        prev.map((s, si) =>
          si === sectionIdx
            ? { ...s, points: s.points.filter((_, pi) => pi !== pointIdx) }
            : s,
        ),
      );
    } catch (error: any) {
      toastError(error?.message || t("toasts.deletePointError"));
    } finally {
      setDeletePointDialog(null);
    }
  };

  // ── Delete Question ───────────────────────────────────────────────────────

  const handleDeleteQuestion = async (sectionIdx: number, questionIdx: number) => {
    const question = sections[sectionIdx].questions[questionIdx];
    try {
      if (question.id) {
        await quizService.deleteQuestion(question.id);
        toastSuccess(t("toasts.deleteQuestion"));
      }
      setSections((prev) =>
        prev.map((s, si) =>
          si === sectionIdx
            ? { ...s, questions: s.questions.filter((_, qi) => qi !== questionIdx) }
            : s,
        ),
      );
    } catch (error: any) {
      toastError(error?.message || t("toasts.deleteQuestionError"));
    } finally {
      setDeleteQuestionDialog(null);
    }
  };

  // ── Local state mutators ──────────────────────────────────────────────────

  const updateSectionField = (idx: number, field: string, value: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const updatePointText = (si: number, pi: number, value: string) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === si
          ? { ...s, points: s.points.map((p, j) => (j === pi ? { ...p, text: value } : p)) }
          : s,
      ),
    );
  };

  const addLocalPoint = (si: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === si ? { ...s, points: [...s.points, { text: "" }] } : s,
      ),
    );
  };

  const updateQuestionField = (si: number, qi: number, field: string, value: string) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === si
          ? {
              ...s,
              questions: s.questions.map((q, j) =>
                j === qi ? { ...q, [field]: value } : q,
              ),
            }
          : s,
      ),
    );
  };

  const addLocalQuestion = (si: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === si
          ? {
              ...s,
              questions: [
                ...s.questions,
                {
                  text: "",
                  type: "multiple_choice" as const,
                  choices: [
                    { text: "", isCorrect: true },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                  ],
                },
              ],
            }
          : s,
      ),
    );
  };

  const updateChoiceField = (
    si: number,
    qi: number,
    ci: number,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === si
          ? {
              ...s,
              questions: s.questions.map((q, j) =>
                j === qi
                  ? {
                      ...q,
                      choices: q.choices.map((c, k) => {
                        if (field === "isCorrect") {
                          return { ...c, isCorrect: k === ci };
                        }
                        return k === ci ? { ...c, text: value as string } : c;
                      }),
                    }
                  : q,
              ),
            }
          : s,
      ),
    );
  };

  const addNewSection = () => {
    setSections((prev) => [
      ...prev,
      {
        name: "",
        isNew: true,
        points: [{ text: "" }],
        questions: [
          {
            text: "",
            type: "multiple_choice" as const,
            choices: [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ],
          },
        ],
      },
    ]);
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const coverToShow = cardInfo.imagePreview || cardInfo.existingImageUrl;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/admin/courses/${courseId}`)}
          className="gap-2"
        >
          {t("viewCourse")}
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-start">
          <h1 className="text-2xl font-bold text-gray-900">{t("pageTitle")}</h1>
          <p className="text-sm text-gray-500 mt-1">{tShared("breadcrumb.courses")} / {tShared("breadcrumb.edit")}</p>
        </div>
      </div>

      {/* ── Section 1: Card Info ──── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleSaveCardInfo}
            disabled={isSavingCard}
            size="sm"
            className="gap-2"
          >
            {isSavingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t("cardSection.saveButton")}
          </Button>
          <div className="text-start">
            <h2 className="text-lg font-bold text-gray-900">{t("cardSection.title")}</h2>
            <p className="text-sm text-gray-400">{t("cardSection.subtitle")}</p>
          </div>
        </div>

        {/* Cover Image */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">{t("cardSection.coverLabel")}</label>
          {coverToShow ? (
            <div className="relative rounded-xl overflow-hidden h-48">
              <Image src={coverToShow} alt="Cover" fill className="object-cover" />
              <button
                onClick={() => setCardInfo((prev) => ({ ...prev, image: null, imagePreview: null, existingImageUrl: undefined }))}
                className="absolute top-3 end-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">{t("cardSection.uploadHint")}</span>
              <span className="text-xs text-gray-400 mt-1">{t("cardSection.uploadSubHint")}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{tShared("form.fields.titleLabel")}</label>
            <Input
              value={cardInfo.title}
              onChange={(e) => setCardInfo((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={tShared("form.fields.titlePlaceholder")}
              className="text-start"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{tShared("form.fields.descLabel")}</label>
            <textarea
              value={cardInfo.description}
              onChange={(e) => setCardInfo((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder={tShared("form.fields.descPlaceholder")}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-start resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{tShared("form.fields.ageRangeLabel")}</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{tShared("form.fields.ageUnit")}</span>
                <Input
                  value={cardInfo.ageFrom}
                  onChange={(e) => setCardInfo((prev) => ({ ...prev, ageFrom: e.target.value }))}
                  type="number"
                  placeholder={tShared("form.fields.ageFrom")}
                  className="text-center w-20"
                />
                <span className="text-gray-400">—</span>
                <Input
                  value={cardInfo.ageTo}
                  onChange={(e) => setCardInfo((prev) => ({ ...prev, ageTo: e.target.value }))}
                  type="number"
                  placeholder={tShared("form.fields.ageTo")}
                  className="text-center w-20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{tShared("form.fields.readingTimeLabel")}</label>
              <Input
                value={cardInfo.readingTime}
                onChange={(e) => setCardInfo((prev) => ({ ...prev, readingTime: e.target.value }))}
                type="number"
                placeholder="30"
                className="text-start"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Content Sections ── */}
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-white rounded-xl border border-gray-100 p-6"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteSectionDialog(sectionIndex)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => handleSaveSection(sectionIndex)}
                disabled={section.isSaving}
                className="gap-1.5"
              >
                {section.isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {section.isNew ? t("sections.addButton") : t("sections.updateButton")}
              </Button>
            </div>
            <div className="text-start">
              <h3 className="font-bold text-gray-900">
                {t("sections.sectionLabel", { n: sectionIndex + 1 })}
                {section.isNew && (
                  <span className="text-xs text-amber-600 font-normal me-2">({t("sections.newBadge")})</span>
                )}
              </h3>
            </div>
          </div>

          {/* Section Name */}
          <div className="bg-gray-50 rounded-lg p-4 mb-5">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">{t("sections.sectionTitleLabel")}</label>
              <Input
                value={section.name}
                onChange={(e) => updateSectionField(sectionIndex, "name", e.target.value)}
                placeholder={tShared("form.sections.sectionTitlePlaceholder")}
                className="text-start"
              />
            </div>

            {/* Points */}
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">{t("sections.pointsLabel")}</label>
            <div className="flex flex-col gap-2 mb-3">
              {section.points.map((point, pointIndex) => (
                <div key={pointIndex} className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      point.id
                        ? setDeletePointDialog({ sectionIdx: sectionIndex, pointIdx: pointIndex })
                        : setSections((prev) =>
                            prev.map((s, i) =>
                              i === sectionIndex
                                ? { ...s, points: s.points.filter((_, pi) => pi !== pointIndex) }
                                : s,
                            ),
                          )
                    }
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Input
                    value={point.text}
                    onChange={(e) => updatePointText(sectionIndex, pointIndex, e.target.value)}
                    placeholder={tShared("form.sections.pointPlaceholder", { n: pointIndex + 1 })}
                    className="text-start flex-1"
                  />
                  <GripVertical className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
            <button
              onClick={() => addLocalPoint(sectionIndex)}
              className="flex items-center gap-1 text-primary text-sm font-medium w-full justify-center py-2 border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("sections.addPoint")}
            </button>
          </div>

          {/* Questions */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-gray-700 text-start">{t("sections.questionsLabel")}</h4>
            {section.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() =>
                      question.id
                        ? setDeleteQuestionDialog({ sectionIdx: sectionIndex, questionIdx: questionIndex })
                        : setSections((prev) =>
                            prev.map((s, i) =>
                              i === sectionIndex
                                ? { ...s, questions: s.questions.filter((_, qi) => qi !== questionIndex) }
                                : s,
                            ),
                          )
                    }
                    className="text-gray-300 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-white px-3 py-0.5 rounded-full text-xs font-semibold">
                      {t("sections.questionLabel", { n: questionIndex + 1 })}
                    </span>
                    <div className="flex rounded-full overflow-hidden border border-gray-200">
                      <button
                        onClick={() => updateQuestionField(sectionIndex, questionIndex, "type", "multiple_choice")}
                        className={cn(
                          "px-3 py-1 text-xs transition-all",
                          question.type === "multiple_choice" ? "bg-emerald-500 text-white" : "bg-white text-gray-500",
                        )}
                      >
                        {tShared("form.sections.typeMultiple")}
                      </button>
                      <button
                        onClick={() => updateQuestionField(sectionIndex, questionIndex, "type", "text")}
                        className={cn(
                          "px-3 py-1 text-xs transition-all",
                          question.type === "text" ? "bg-red-500 text-white" : "bg-white text-gray-500",
                        )}
                      >
                        {tShared("form.sections.typeFree")}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1 text-start">{tShared("detail.content.questionText")}</label>
                  <Input
                    value={question.text}
                    onChange={(e) => updateQuestionField(sectionIndex, questionIndex, "text", e.target.value)}
                    placeholder={tShared("form.sections.questionPlaceholder")}
                    className="text-start"
                  />
                </div>

                {question.type === "multiple_choice" && (
                  <div className="grid grid-cols-2 gap-3">
                    {question.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center gap-2">
                        <Input
                          value={choice.text}
                          onChange={(e) => updateChoiceField(sectionIndex, questionIndex, choiceIndex, "text", e.target.value)}
                          placeholder={tShared("form.sections.choicePlaceholder", { n: choiceIndex + 1 })}
                          className="text-start flex-1"
                        />
                        <button
                          onClick={() => updateChoiceField(sectionIndex, questionIndex, choiceIndex, "isCorrect", true)}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all shrink-0",
                            choice.isCorrect
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-200 text-gray-500 hover:bg-gray-300",
                          )}
                        >
                          {choiceIndex + 1}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => addLocalQuestion(sectionIndex)}
              className="flex items-center gap-1 text-primary text-sm font-medium w-full justify-center py-3 border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("sections.addQuestion")}
            </button>
          </div>
        </div>
      ))}

      {/* Add Section Button */}
      <button
        onClick={addNewSection}
        className="flex items-center gap-2 text-primary text-sm font-semibold w-full justify-center py-4 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
      >
        <Plus className="w-5 h-5" />
        {t("sections.addSection")}
      </button>

      {/* Bottom Nav */}
      <div className="flex justify-between items-center bg-white rounded-xl border border-gray-100 p-4">
        <Button
          onClick={() => router.push(`/dashboard/admin/courses/${courseId}`)}
          className="gap-2"
        >
          {t("backToDetail")}
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/admin/courses")}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          {t("allCourses")}
        </Button>
      </div>

      {/* Delete dialogs */}
      <ConfirmationDialog
        isOpen={deleteSectionDialog !== null}
        onClose={() => setDeleteSectionDialog(null)}
        onConfirm={() => deleteSectionDialog !== null && handleDeleteSection(deleteSectionDialog)}
        title={t("dialogs.deleteSectionTitle")}
        description={t("dialogs.deleteSectionDescription")}
        variant="destructive"
      />
      <ConfirmationDialog
        isOpen={deletePointDialog !== null}
        onClose={() => setDeletePointDialog(null)}
        onConfirm={() => deletePointDialog && handleDeletePoint(deletePointDialog.sectionIdx, deletePointDialog.pointIdx)}
        title={t("dialogs.deletePointTitle")}
        description={t("dialogs.deletePointDescription")}
        variant="destructive"
      />
      <ConfirmationDialog
        isOpen={deleteQuestionDialog !== null}
        onClose={() => setDeleteQuestionDialog(null)}
        onConfirm={() => deleteQuestionDialog && handleDeleteQuestion(deleteQuestionDialog.sectionIdx, deleteQuestionDialog.questionIdx)}
        title={t("dialogs.deleteQuestionTitle")}
        description={t("dialogs.deleteQuestionDescription")}
        variant="destructive"
      />
    </div>
  );
};

export default CourseEditForm;
