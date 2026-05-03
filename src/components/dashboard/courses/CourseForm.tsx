"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/services/quizService";
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
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toastSuccess, toastError, toastWarning } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl";

// ── Types ────────────────────────────────────────────────────────────────────

interface ChoiceData {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionData {
  id?: string;
  text: string;
  type: "text" | "multiple_choice";
  choices: ChoiceData[];
}

interface PointData {
  id?: string;
  text: string;
}

interface SectionData {
  id?: string;
  name: string;
  points: PointData[];
  questions: QuestionData[];
  // Track save state per section
  saveStatus?: "pending" | "saving" | "saved" | "error";
  saveError?: string;
}

interface CardInfo {
  title: string;
  description: string;
  readingTime: string;
  ageFrom: string;
  ageTo: string;
  image: File | null;
  imagePreview: string | null;
}

interface ContentInfo {
  mainContent: string;
  sections: SectionData[];
}

// ── Main Component ────────────────────────────────────────────────────────────

const CourseForm = () => {
  const t = useTranslations("dashboard.admin-courses.form");
  const tShared = useTranslations("dashboard.admin-courses");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState<number | null>(null);
  const [createdContentId, setCreatedContentId] = useState<number | null>(null);

  // Step 1: Card Info
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    title: "",
    description: "",
    readingTime: "",
    ageFrom: "",
    ageTo: "",
    image: null,
    imagePreview: null,
  });

  // Step 2: Content & Quiz
  const [contentInfo, setContentInfo] = useState<ContentInfo>({
    mainContent: "",
    sections: [
      {
        name: "",
        saveStatus: "pending",
        points: [{ text: "" }],
        questions: [
          {
            text: "",
            type: "multiple_choice",
            choices: [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ],
          },
        ],
      },
    ],
  });

  // ── Image handling ───────────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toastError(t("cover.sizeError"));
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

  const removeImage = () => {
    setCardInfo((prev) => ({ ...prev, image: null, imagePreview: null }));
  };

  // ── Section / Point / Question / Choice handlers ──────────────────────────

  const updateSectionStatus = (
    index: number,
    status: SectionData["saveStatus"],
    error?: string,
  ) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === index ? { ...s, saveStatus: status, saveError: error } : s,
      ),
    }));
  };

  const addSection = () => {
    setContentInfo((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          name: "",
          saveStatus: "pending" as const,
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
      ],
    }));
  };

  const updateSection = (index: number, field: string, value: string) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const removeSection = (index: number) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const addPoint = (sectionIndex: number) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === sectionIndex
          ? { ...s, points: [...s.points, { text: "" }] }
          : s,
      ),
    }));
  };

  const updatePoint = (
    sectionIndex: number,
    pointIndex: number,
    value: string,
  ) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              points: s.points.map((p, pi) =>
                pi === pointIndex ? { ...p, text: value } : p,
              ),
            }
          : s,
      ),
    }));
  };

  const removePoint = (sectionIndex: number, pointIndex: number) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? { ...s, points: s.points.filter((_, pi) => pi !== pointIndex) }
          : s,
      ),
    }));
  };

  const addQuestion = (sectionIndex: number) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === sectionIndex
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
    }));
  };

  const updateQuestion = (
    sectionIndex: number,
    questionIndex: number,
    field: string,
    value: string,
  ) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              questions: s.questions.map((q, qi) =>
                qi === questionIndex ? { ...q, [field]: value } : q,
              ),
            }
          : s,
      ),
    }));
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              questions: s.questions.filter((_, qi) => qi !== questionIndex),
            }
          : s,
      ),
    }));
  };

  const updateChoice = (
    sectionIndex: number,
    questionIndex: number,
    choiceIndex: number,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) => {
    setContentInfo((prev) => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIndex
          ? {
              ...s,
              questions: s.questions.map((q, qi) =>
                qi === questionIndex
                  ? {
                      ...q,
                      choices: q.choices.map((c, ci) => {
                        if (field === "isCorrect") {
                          return { ...c, isCorrect: ci === choiceIndex };
                        }
                        return ci === choiceIndex
                          ? { ...c, text: value as string }
                          : c;
                      }),
                    }
                  : q,
              ),
            }
          : s,
      ),
    }));
  };

  // ── Step 1 Validation ────────────────────────────────────────────────────

  const isStep1Valid = () =>
    cardInfo.title.trim() &&
    cardInfo.description.trim() &&
    cardInfo.readingTime.trim() &&
    cardInfo.ageFrom.trim() &&
    cardInfo.ageTo.trim();

  // ── Submit Step 1 ────────────────────────────────────────────────────────

  const handleStep1Submit = async () => {
    if (!isStep1Valid()) {
      toastError(t("toasts.requiredFields"));
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await quizService.create({
        quiz_title: cardInfo.title,
        description: cardInfo.description,
        reading_time: cardInfo.readingTime,
        from: cardInfo.ageFrom,
        to: cardInfo.ageTo,
        image: cardInfo.image!,
      });
      const quizId = result.data?.id;
      if (quizId) {
        setCreatedQuizId(quizId);
        setCurrentStep(2);
        toastSuccess(t("toasts.createSuccess"));
      }
    } catch (error: any) {
      toastError(error?.message || t("toasts.createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submit Step 2 (resilient – section-by-section with status tracking) ──

  const handleStep2Submit = async () => {
    if (!createdQuizId) return;
    setIsSubmitting(true);

    let contentId = createdContentId;

    try {
      // 1. Create or reuse Content
      if (!contentId) {
        const contentResult = await quizService.createContent({
          quiz_id: String(createdQuizId),
          content_description: contentInfo.mainContent,
        });
        contentId = contentResult.id;
        setCreatedContentId(contentId);
      }

      // 2. Save each section independently – failures are isolated
      let savedCount = 0;
      let failedCount = 0;

      for (let si = 0; si < contentInfo.sections.length; si++) {
        const section = contentInfo.sections[si];
        if (!section.name.trim()) continue;
        // Skip already-saved sections
        if (section.saveStatus === "saved") {
          savedCount++;
          continue;
        }

        updateSectionStatus(si, "saving");

        try {
          // Create partition
          const partitionResult = await quizService.createPartition({
            quiz_content_id: String(contentId),
            name: section.name,
          });
          const partitionId = partitionResult.data?.id;
          if (!partitionId) throw new Error(t("toasts.contentError"));

          // Create points
          for (const point of section.points) {
            if (!point.text.trim()) continue;
            await quizService.createPoint({
              partition_id: String(partitionId),
              point: point.text,
            });
          }

          // Create questions + choices
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

          updateSectionStatus(si, "saved");
          savedCount++;
        } catch (sectionError: any) {
          // Isolate the failure – mark section as error but keep going
          updateSectionStatus(
            si,
            "error",
            sectionError?.message || t("toasts.saveError"),
          );
          failedCount++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["quizzes"] });

      if (failedCount === 0) {
        toastSuccess(t("toasts.saveSuccess"));
        router.push(`/dashboard/admin/courses/${createdQuizId}`);
      } else if (savedCount > 0) {
        // Partial success — stay on the page so user can retry failed sections
        toastWarning(t("sections.partialFailureBody"));
      } else {
        toastError(t("toasts.saveError"));
        router.push(`/dashboard/admin/courses/${createdQuizId}`);
      }
    } catch (error: any) {
      toastError(error?.message || t("toasts.contentError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-start">
        <h1 className="text-2xl font-bold text-gray-900">{t("pageTitle")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {tShared("breadcrumb.courses")} / {tShared("breadcrumb.new")}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition-all",
              currentStep >= 2
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 bg-gray-50 text-gray-300",
            )}
          >
            ٢
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">{t("steps.step2Label")}</p>
            <p className={cn("text-sm font-semibold", currentStep >= 2 ? "text-primary" : "text-gray-400")}>
              {t("steps.step2Title")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-[-24px]">
          <div className={cn("w-8 h-0.5", currentStep >= 2 ? "bg-primary" : "bg-gray-200")} />
          <div className={cn("w-2 h-2 rounded-full", currentStep >= 2 ? "bg-primary" : "bg-gray-200")} />
          <div className={cn("w-8 h-0.5", currentStep >= 2 ? "bg-primary" : "bg-gray-200")} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition-all",
              currentStep >= 1
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 bg-gray-50 text-gray-300",
            )}
          >
            ١
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">{t("steps.step1Label")}</p>
            <p className={cn("text-sm font-semibold", currentStep >= 1 ? "text-primary" : "text-gray-400")}>
              {t("steps.step1Title")}
            </p>
          </div>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => currentStep > 1 && setCurrentStep(1)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            currentStep === 1
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-gray-400 hover:bg-gray-50",
          )}
        >
          {t("steps.tabStep1")}
        </button>
        <button
          onClick={() => createdQuizId && setCurrentStep(2)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            currentStep === 2
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-gray-400 hover:bg-gray-50",
            !createdQuizId && "opacity-50 cursor-not-allowed",
          )}
        >
          {t("steps.tabStep2")}
        </button>
      </div>

      {/* ── Step 1: Card Info ─────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-8">
          {/* Cover Image */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 justify-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900 text-start">{t("cover.title")}</h2>
                <p className="text-sm text-gray-400 text-start">{t("cover.subtitle")}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
            </div>

            {cardInfo.imagePreview ? (
              <div className="relative rounded-xl overflow-hidden h-48">
                <Image src={cardInfo.imagePreview} alt="Cover preview" fill className="object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-3 end-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-base font-medium text-gray-600">{t("cover.upload")}</span>
                <span className="text-xs text-gray-400 mt-1">{t("cover.uploadHint")}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Card Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6 justify-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900 text-start">{t("fields.cardDetailsTitle")}</h2>
                <p className="text-sm text-gray-400 text-start">{t("fields.cardDetailsSubtitle")}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">{t("fields.titleLabel")}</label>
                <Input
                  value={cardInfo.title}
                  onChange={(e) => setCardInfo((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder={t("fields.titlePlaceholder")}
                  className="text-start"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">{t("fields.descLabel")}</label>
                <textarea
                  value={cardInfo.description}
                  onChange={(e) => setCardInfo((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={t("fields.descPlaceholder")}
                  rows={3}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-start resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">{t("fields.ageRangeLabel")}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{t("fields.ageUnit")}</span>
                    <Input
                      value={cardInfo.ageFrom}
                      onChange={(e) => setCardInfo((prev) => ({ ...prev, ageFrom: e.target.value }))}
                      placeholder="3"
                      type="number"
                      className="text-center w-20"
                    />
                    <span className="text-gray-400">—</span>
                    <Input
                      value={cardInfo.ageTo}
                      onChange={(e) => setCardInfo((prev) => ({ ...prev, ageTo: e.target.value }))}
                      placeholder="12"
                      type="number"
                      className="text-center w-20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-start">{t("fields.readingTimeLabel")}</label>
                  <Input
                    value={cardInfo.readingTime}
                    onChange={(e) => setCardInfo((prev) => ({ ...prev, readingTime: e.target.value }))}
                    placeholder="30"
                    type="number"
                    className="text-start"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Content & Quiz sections ──────────────────────────────── */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-8">
          {/* Failure notice if any section errored */}
          {contentInfo.sections.some((s) => s.saveStatus === "error") && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">{t("sections.partialFailureTitle")}</p>
                <p className="mt-1 text-amber-700">
                  {t("sections.partialFailureBody")}
                </p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 justify-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900 text-start">{t("content.mainTitle")}</h2>
                <p className="text-sm text-gray-400 text-start">{t("content.mainSubtitle")}</p>
              </div>
            </div>
            <textarea
              value={contentInfo.mainContent}
              onChange={(e) => setContentInfo((prev) => ({ ...prev, mainContent: e.target.value }))}
              placeholder={t("content.mainPlaceholder")}
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-start resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Sections */}
          {contentInfo.sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={cn(
                "bg-white rounded-xl border p-6 transition-all",
                section.saveStatus === "saved"
                  ? "border-emerald-200 bg-emerald-50/30"
                  : section.saveStatus === "error"
                    ? "border-red-200 bg-red-50/20"
                    : "border-gray-100",
              )}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {section.saveStatus === "saved" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  {section.saveStatus === "saving" && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  {section.saveStatus === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <button
                    onClick={() => removeSection(sectionIndex)}
                    className={cn(
                      "text-gray-300 hover:text-red-400 transition-colors",
                      section.saveStatus === "saved" && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={section.saveStatus === "saved"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  {t("sections.sectionLabel", { n: sectionIndex + 1 })}:{" "}
                  {section.name || t("sections.sectionTitlePlaceholder")}
                  {section.saveStatus === "saved" && (
                    <span className="text-xs text-emerald-600 font-normal me-2">{t("sections.saved")}</span>
                  )}
                  {section.saveStatus === "error" && (
                    <span className="text-xs text-red-500 font-normal me-2">{t("sections.failed")}</span>
                  )}
                </h3>
              </div>

              {/* Error message */}
              {section.saveStatus === "error" && section.saveError && (
                <p className="text-xs text-red-500 mb-4 text-start">{section.saveError}</p>
              )}

              {/* Section Title & Points */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 text-start">{t("sections.titleAndPoints")}</h4>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1 text-start">{t("sections.sectionTitleLabel")}</label>
                  <Input
                    value={section.name}
                    onChange={(e) => updateSection(sectionIndex, "name", e.target.value)}
                    placeholder={t("sections.sectionTitlePlaceholder")}
                    className="text-start"
                    disabled={section.saveStatus === "saved"}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {section.points.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex items-center gap-2">
                      <button
                        onClick={() => removePoint(sectionIndex, pointIndex)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        disabled={section.saveStatus === "saved"}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Input
                        value={point.text}
                        onChange={(e) => updatePoint(sectionIndex, pointIndex, e.target.value)}
                        placeholder={t("sections.pointPlaceholder", { n: pointIndex + 1 })}
                        className="text-start flex-1"
                        disabled={section.saveStatus === "saved"}
                      />
                      <GripVertical className="w-4 h-4 text-gray-300" />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addPoint(sectionIndex)}
                  disabled={section.saveStatus === "saved"}
                  className="mt-3 flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80 transition-colors w-full justify-center py-2 border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {t("sections.addPoint")}
                </button>
              </div>

              {/* Questions */}
              <div className="flex flex-col gap-6">
                {section.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => removeQuestion(sectionIndex, questionIndex)}
                        className="text-gray-300 hover:text-red-400"
                        disabled={section.saveStatus === "saved"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="bg-primary text-white px-3 py-0.5 rounded-full text-xs font-semibold">
                          {t("sections.questionLabel", { n: questionIndex + 1 })}
                        </span>
                        <div className="flex rounded-full overflow-hidden border border-gray-200">
                          <button
                            onClick={() => updateQuestion(sectionIndex, questionIndex, "type", "multiple_choice")}
                            disabled={section.saveStatus === "saved"}
                            className={cn(
                              "px-3 py-1 text-xs transition-all",
                              question.type === "multiple_choice"
                                ? "bg-emerald-500 text-white"
                                : "bg-white text-gray-500",
                            )}
                          >
                            {t("sections.typeMultiple")}
                          </button>
                          <button
                            onClick={() => updateQuestion(sectionIndex, questionIndex, "type", "text")}
                            disabled={section.saveStatus === "saved"}
                            className={cn(
                              "px-3 py-1 text-xs transition-all",
                              question.type === "text"
                                ? "bg-red-500 text-white"
                                : "bg-white text-gray-500",
                            )}
                          >
                            {t("sections.typeFree")}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm text-gray-600 mb-1 text-start">{tShared("detail.content.questionText")}</label>
                      <Input
                        value={question.text}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, "text", e.target.value)}
                        placeholder={t("sections.questionPlaceholder")}
                        className="text-start"
                        disabled={section.saveStatus === "saved"}
                      />
                    </div>

                    {question.type === "multiple_choice" && (
                      <div className="grid grid-cols-2 gap-3">
                        {question.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="flex items-center gap-2">
                            <Input
                              value={choice.text}
                              onChange={(e) => updateChoice(sectionIndex, questionIndex, choiceIndex, "text", e.target.value)}
                              placeholder={t("sections.choicePlaceholder", { n: choiceIndex + 1 })}
                              className="text-start flex-1"
                              disabled={section.saveStatus === "saved"}
                            />
                            <button
                              onClick={() => updateChoice(sectionIndex, questionIndex, choiceIndex, "isCorrect", true)}
                              disabled={section.saveStatus === "saved"}
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
                  onClick={() => addQuestion(sectionIndex)}
                  disabled={section.saveStatus === "saved"}
                  className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80 transition-colors w-full justify-center py-3 border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {t("sections.addQuestion")}
                </button>
              </div>
            </div>
          ))}

          {/* Add Section */}
          <button
            onClick={addSection}
            className="flex items-center gap-2 text-primary text-sm font-semibold hover:text-primary/80 transition-colors w-full justify-center py-4 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5"
          >
            <Plus className="w-5 h-5" />
            {t("sections.addSection")}
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between sticky bottom-0 shadow-sm">
        <Button
          onClick={currentStep === 1 ? handleStep1Submit : handleStep2Submit}
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("buttons.saving")}
            </>
          ) : (
            <>
              {currentStep === 1 ? t("buttons.next") : t("buttons.save")}
              <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </Button>

        <span className="text-sm text-gray-400">{t("steps.stepCounter", { step: currentStep })}</span>

        <Button
          variant="ghost"
          onClick={() => {
            if (currentStep === 2) {
              setCurrentStep(1);
            } else {
              router.push("/dashboard/admin/courses");
            }
          }}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          {currentStep === 2 ? t("buttons.back") : t("buttons.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default CourseForm;
