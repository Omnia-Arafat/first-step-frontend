"use client";

import Image from "next/image";
import { Calendar, Eye, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Quiz } from "@/services/quizService";
import { useTranslations } from "next-intl";

interface CourseCardProps {
  course: Quiz;
  onClick?: () => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  const t = useTranslations("dashboard.admin-courses.card");
  const isPublished = course.status === "published";

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

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl shadow-card overflow-hidden cursor-pointer",
        "transition-all duration-300 ease-in-out",
        "hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01]",
        "flex flex-col",
      )}
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/10 to-primary/30 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary/40" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 start-3">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              isPublished
                ? "bg-emerald-500 text-white"
                : "bg-amber-400 text-amber-900",
            )}
          >
            {isPublished ? t("published") : t("draft")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-gray-900 text-base line-clamp-2 leading-relaxed">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
          {course.reading_time && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {course.reading_time}{" "}
                {Number(course.reading_time) > 1 ? t("lessons") : t("lesson")}
              </span>
            </div>
          )}
          {course.from && course.to && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {t("ageRange", { from: course.from, to: course.to })}
              </span>
            </div>
          )}
          {course.views_count !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{t("views", { count: course.views_count })}</span>
            </div>
          )}
        </div>

        {/* Date */}
        {course.created_at && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(course.created_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
