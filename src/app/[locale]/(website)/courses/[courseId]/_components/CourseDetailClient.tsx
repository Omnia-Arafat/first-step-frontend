"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Clock,
  Plus,
  Trash2,
  Loader2,
  Target,
  BookOpen,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/forms/PhoneInput";
import { cn } from "@/lib/utils";
import { startCoursePaymentAction } from "@/actions/courseActions";
import type { ApiCourse } from "@/services/api";

const bookingSchema = z.object({
  name: z.string().min(2, "required"),
  phone: z.string().min(1, "required"),
  email: z.string().email("invalidEmail"),
  children: z.array(z.object({ name: z.string().min(1, "required") })).min(1, "minChildren"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function CourseDetailClient({
  course,
  locale,
}: {
  course: ApiCourse;
  locale: "ar" | "en";
}) {
  const t = useTranslations("courses");
  const isRtl = locale === "ar";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen">
      {/* Back */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-primary-blue hover:text-primary-blue-400 transition-colors text-sm font-medium"
        >
          <BackArrow size={16} />
          {t("backToCourses")}
        </Link>
      </div>

      {/* Header image */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative w-full h-72 md:h-[22rem] lg:h-[28rem] rounded-2xl overflow-hidden bg-primary-blue-50">
          {course.image && (
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-primary-blue/90 via-primary-blue/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 drop-shadow-md">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {course.duration_description && (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/30">
                      <Clock className="w-4 h-4" />
                      {course.duration_description}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/30">
                    {course.price}
                  </span>
                </div>
              </div>
              <Button asChild size="sm" className="blue-gradient shrink-0 text-base px-8 shadow-lg">
                <a href="#booking">{t("registerNow")}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 space-y-12">
        {/* Description */}
        <Section icon={<BookOpen className="w-6 h-6" />} title={t("descriptionTitle")}>
          <div className="text-gray leading-relaxed whitespace-pre-line">{course.description}</div>
        </Section>

        {/* Goal */}
        {course.goal && (
          <Section icon={<Target className="w-6 h-6" />} title={t("goalTitle")}>
            <div className="bg-linear-to-b from-white/15 via-secondary-mint-green/12 to-secondary-mint-green/24 rounded-xl p-6">
              <p className="text-lg font-medium text-gray-800">{course.goal}</p>
            </div>
          </Section>
        )}

        {/* Contents / Timeline */}
        {course.contents && course.contents.length > 0 && (
          <Section icon={<ListOrdered className="w-6 h-6" />} title={t("timelineTitle")}>
            <div className="max-h-[480px] overflow-y-auto space-y-3 pe-1">
              {course.contents.map((item, index) => (
                <TimelineItem key={index} item={item} index={index} colorIndex={index % 2} />
              ))}
            </div>
          </Section>
        )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <Section icon={<CheckCircle2 className="w-6 h-6" />} title={t("requirementsTitle")}>
            <ul className="space-y-3">
              {course.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-secondary-burgundy flex-shrink-0" />
                  <span className="text-gray leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Duration & Price */}
        <Section icon={<Clock className="w-6 h-6" />} title={t("durationTitle")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-primary-blue-50 rounded-xl p-6">
              <h4 className="text-sm font-medium text-primary-blue-400 mb-2">{t("durationTitle")}</h4>
              <p className="text-primary-blue font-medium">
                {course.duration_description || `${course.duration} ${locale === "ar" ? "يوم" : "days"}`}
              </p>
              {course.hours > 0 && (
                <p className="text-primary-blue-400 text-sm mt-1">
                  {course.hours} {locale === "ar" ? "ساعة" : "hours"}
                </p>
              )}
            </div>
            <div className="bg-primary-green-50 rounded-xl p-6">
              <h4 className="text-sm font-medium text-primary-green-700 mb-2">{t("priceTitle")}</h4>
              <p className="text-primary-green-700 font-medium">{course.price}</p>
            </div>
          </div>
        </Section>

        {/* Booking Form */}
        <BookingForm course={course} locale={locale} />
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="text-primary-blue">{icon}</div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-blue">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const TIMELINE_COLORS = [
  { bg: "bg-primary-blue-50", accent: "bg-primary-blue", text: "text-primary-blue" },
  { bg: "bg-primary-green-50", accent: "bg-secondary-mint-green", text: "text-secondary-mint-green" },
] as const;

function TimelineItem({
  item,
  index,
  colorIndex,
}: {
  item: { title: string; topics?: string[] };
  index: number;
  colorIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const color = TIMELINE_COLORS[colorIndex];

  return (
    <div className={cn("rounded-2xl transition-all duration-300", color.bg, open && "shadow-md")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-start"
      >
        <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm", color.accent)}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 truncate">{item.title}</h4>
        </div>
        {item.topics && item.topics.length > 0 && (
          <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0", open && "rotate-180")} />
        )}
      </button>

      {open && item.topics && item.topics.length > 0 && (
        <div className="px-4 pb-4">
          <ul className="ms-[52px] space-y-1.5">
            {item.topics.map((topic, ti) => (
              <li key={ti} className="text-sm text-gray-600 flex items-start gap-2">
                <span className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0", color.accent)} />
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BookingForm({ course, locale }: { course: ApiCourse; locale: "ar" | "en" }) {
  const t = useTranslations("courses");
  const [isPending, startTransition] = useTransition();
  // Generated once per form session — same key on retries, new key on fresh mount
  const idempotencyKey = React.useRef(crypto.randomUUID());

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: "", phone: "", email: "", children: [{ name: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "children" });

  const onSubmit = (data: BookingFormData) => {
    // Rotate key on every new submission attempt
    idempotencyKey.current = crypto.randomUUID();
    startTransition(async () => {
      try {
        const result = await startCoursePaymentAction(
          {
            course_id: course.id,
            name: data.name,
            phone: data.phone,
            email: data.email,
            children: data.children.map((c) => c.name),
          },
          idempotencyKey.current,
        );

        console.log("[onSubmit] result:", result);

        if (result.success && result.payment_url) {
          window.location.replace(result.payment_url);
        } else {
          toast.error(result.error || t("form.error"));
        }
      } catch {
        toast.error(t("form.error"));
      }
    });
  };

  return (
    <section id="booking">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-blue mb-2">{t("bookingTitle")}</h2>
        <p className="text-gray-500 mb-8">{t("bookingSubtitle")}</p>

        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onSubmit)(e); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("form.name")} <span className="text-destructive">*</span>
              </label>
              <Input
                {...form.register("name")}
                placeholder={t("form.namePlaceholder")}
                className={cn(form.formState.errors.name && "border-destructive")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{t(`form.errors.${form.formState.errors.name.message}`)}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("form.email")} <span className="text-destructive">*</span>
              </label>
              <Input
                {...form.register("email")}
                type="email"
                placeholder={t("form.emailPlaceholder")}
                className={cn(form.formState.errors.email && "border-destructive")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{t(`form.errors.${form.formState.errors.email.message}`)}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                {t("form.phone")} <span className="text-destructive">*</span>
              </label>
              <PhoneInput
                value={form.watch("phone")}
                onChange={(val: string) => form.setValue("phone", val, { shouldValidate: true })}
                className={cn(form.formState.errors.phone && "border-destructive")}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{t(`form.errors.${form.formState.errors.phone.message}`)}</p>
              )}
            </div>
          </div>

          {/* Children */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              {t("form.childrenNames")} <span className="text-destructive">*</span>
            </label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      {...form.register(`children.${index}.name`)}
                      placeholder={t("form.childNamePlaceholder")}
                      className={cn(form.formState.errors.children?.[index]?.name && "border-destructive")}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline ltr:ml-1 rtl:mr-1">{t("form.removeChild")}</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "" })}
              className="text-primary-blue hover:text-primary-blue"
            >
              <Plus className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
              {t("form.addChild")}
            </Button>
            {form.formState.errors.children?.root && (
              <p className="text-sm text-destructive">{t(`form.errors.${form.formState.errors.children.root.message}`)}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 pt-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
              className="w-full sm:w-auto min-w-[150px]"
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="w-full sm:w-auto min-w-[150px] blue-gradient"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2" />
                  {t("form.submitting")}
                </>
              ) : (
                t("form.submit")
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
