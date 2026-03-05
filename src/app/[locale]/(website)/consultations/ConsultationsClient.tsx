"use client";

import React, { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Share2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import PhoneInput from "@/components/forms/PhoneInput";
import { FileUploader } from "@/components/forms/FileUploader";
import {
  sendCenterConsultationAction,
  sendParentConsultationAction,
} from "@/actions/consultationActions";

type TabType = "parent" | "center";

interface ConsultationsClientProps {
  initialTab: TabType;
  locale: string;
}

const saudiPhoneSchema = z
  .string()
  .regex(/^(009665|9665|\+9665|05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/, {
    message: "invalidPhone",
  });

// Parent consultation form schema
const parentConsultationSchema = z.object({
  name: z.string().optional(),
  phone: saudiPhoneSchema.optional().or(z.literal("")),
  email: z.string().email("invalidEmail").optional().or(z.literal("")),
  kind_of_user: z.string().optional(),
  kind_of_user_other: z.string().optional(),
  subject_of_consultation: z.string().optional(),
  subject_of_consultation_other: z.string().optional(),
  description: z.string().min(1, "required"),
  file: z.any().optional(),
});

// Center consultation form schema
const centerConsultationSchema = z.object({
  center_name: z.string().optional(),
  center_specification: z.string().optional(),
  center_specification_other: z.string().optional(),
  name_of_consultan_request: z.string().optional(),
  mission_of_consultant_request: z.string().optional(),
  phone: saudiPhoneSchema.optional().or(z.literal("")),
  email: z.string().email("invalidEmail").optional().or(z.literal("")),
  subject_of_consultan: z.string().optional(),
  subject_of_consultan_other: z.string().optional(),
  description: z.string().min(1, "required"),
  file: z.any().optional(),
});

type ParentFormData = z.infer<typeof parentConsultationSchema>;
type CenterFormData = z.infer<typeof centerConsultationSchema>;

export default function ConsultationsClient({
  initialTab,
  locale,
}: ConsultationsClientProps) {
  const t = useTranslations("consultations");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isPending, startTransition] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [multiplier, setMultiplier] = useState(120);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const availableWidth = Math.min(width, 1400) - 400;
      const newMultiplier = Math.min(Math.max(availableWidth / 7, 70), 180);
      setMultiplier(newMultiplier);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const parentsGuide = t.raw("tips.parents").map((tip: any) => ({
    ...tip,
    image: tip.image || "/assets/illustrations/parent.png",
  }));

  const centersGuide = t.raw("tips.centers").map((tip: any) => ({
    ...tip,
    image: tip.image || "/assets/illustrations/center.png",
  }));

  const guides = activeTab === "parent" ? parentsGuide : centersGuide;

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % guides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [guides.length, activeTab]);

  const parentForm = useForm<ParentFormData>({
    resolver: zodResolver(parentConsultationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      kind_of_user: "",
      kind_of_user_other: "",
      subject_of_consultation: "",
      subject_of_consultation_other: "",
      description: "",
      file: null,
    },
  });

  const centerForm = useForm<CenterFormData>({
    resolver: zodResolver(centerConsultationSchema),
    defaultValues: {
      center_name: "",
      center_specification: "",
      center_specification_other: "",
      name_of_consultan_request: "",
      mission_of_consultant_request: "",
      phone: "",
      email: "",
      subject_of_consultan: "",
      subject_of_consultan_other: "",
      description: "",
      file: null,
    },
  });

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    setSelectedIndex(0);
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "center") params.set("type", "center");
    else params.delete("type");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("share.title"),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("share.copied"));
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const onParentSubmit = (data: ParentFormData) => {
    startTransition(async () => {
      try {
        let fileFormData: FormData | undefined;
        if (data.file instanceof File) {
          fileFormData = new FormData();
          fileFormData.append("file", data.file);
        }

        const payload = {
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          kind_of_user:
            data.kind_of_user === "other"
              ? data.kind_of_user_other || "Other"
              : data.kind_of_user || "",
          subject_of_consultation:
            data.subject_of_consultation === "other"
              ? data.subject_of_consultation_other || "Other"
              : data.subject_of_consultation || "",
          description: data.description,
        };

        const result = await sendParentConsultationAction(
          payload,
          fileFormData
        );
        if (result.success) {
          toast.success(t("form.success"));
          parentForm.reset();
        } else {
          toast.error(result.error || t("form.error"));
        }
      } catch (error) {
        toast.error(t("form.error"));
      }
    });
  };

  const onCenterSubmit = (data: CenterFormData) => {
    startTransition(async () => {
      try {
        let fileFormData: FormData | undefined;
        if (data.file instanceof File) {
          fileFormData = new FormData();
          fileFormData.append("file", data.file);
        }

        const payload = {
          center_name: data.center_name || "",
          center_specification:
            data.center_specification === "other"
              ? data.center_specification_other || "Other"
              : data.center_specification || "",
          name_of_consultan_request: data.name_of_consultan_request || "",
          mission_of_consultant_request:
            data.mission_of_consultant_request || "",
          phone: data.phone || "",
          email: data.email || "",
          subject_of_consultan:
            data.subject_of_consultan === "other"
              ? data.subject_of_consultan_other || "Other"
              : data.subject_of_consultan || "",
          description: data.description,
        };

        const result = await sendCenterConsultationAction(
          payload,
          fileFormData
        );
        if (result.success) {
          toast.success(t("form.success"));
          centerForm.reset();
        } else {
          toast.error(result.error || t("form.error"));
        }
      } catch (error) {
        toast.error(t("form.error"));
      }
    });
  };

  const handleCancel = () => {
    if (activeTab === "parent") parentForm.reset();
    else centerForm.reset();
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onShare={handleShare}
          t={t}
        />

        <InfoSection activeTab={activeTab} t={t} />

        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-blue mb-2">
            {activeTab === "parent"
              ? t("parent.formTitle")
              : t("center.formTitle")}
          </h2>
          <p className="text-gray-500 mb-8">{t("form.subtitle")}</p>

          {activeTab === "parent" ? (
            <ParentFormSection
              form={parentForm}
              onSubmit={onParentSubmit}
              onCancel={handleCancel}
              isPending={isPending}
              t={t}
            />
          ) : (
            <CenterFormSection
              form={centerForm}
              onSubmit={onCenterSubmit}
              onCancel={handleCancel}
              isPending={isPending}
              t={t}
            />
          )}
        </div>

        <EducationCarousel
          guides={guides}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          multiplier={multiplier}
          t={t}
        />
      </div>
    </div>
  );
}

// --- Sub-components ---

function TabSwitcher({
  activeTab,
  onTabChange,
  onShare,
  t,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onShare: () => void;
  t: any;
}) {
  return (
    <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mb-8">
      <div className="flex items-center border border-primary rounded-xl overflow-hidden bg-white w-full md:w-auto">
        <button
          type="button"
          onClick={() => onTabChange("center")}
          className={cn(
            "flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-2 transition-all duration-300 font-medium min-w-[200px]",
            activeTab === "center"
              ? "blue-gradient text-white"
              : "text-primary hover:bg-gray-50 bg-white"
          )}
        >
          <span>{t("tabs.centers")}</span>
          <div className="relative w-8 h-8">
            <Image
              src="/assets/illustrations/center.png"
              alt="icon"
              fill
              className="object-contain"
            />
          </div>
        </button>
        <div className="w-px h-full bg-primary" />
        <button
          type="button"
          onClick={() => onTabChange("parent")}
          className={cn(
            "flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-2 transition-all duration-300 font-medium min-w-[200px]",
            activeTab === "parent"
              ? "blue-gradient text-white"
              : "text-primary hover:bg-gray-50 bg-white"
          )}
        >
          <span>{t("tabs.parents")}</span>
          <div className="relative w-8 h-8">
            <Image
              src="/assets/illustrations/parent.png"
              alt="icon"
              fill
              className="object-contain"
            />
          </div>
        </button>
      </div>

      <Button
        variant="outline"
        onClick={onShare}
        size="sm"
        className="w-full md:w-auto"
      >
        <span>{t("share.button")}</span>
        <Share2 className="w-5 h-5" />
      </Button>
    </div>
  );
}

function InfoSection({ activeTab, t }: { activeTab: TabType; t: any }) {
  return (
    <div className="bg-linear-to-b from-white/15 via-secondary-mint-green/12 to-secondary-mint-green/24 rounded-2xl p-6 md:p-8 mb-8">
      <p className="text-lg md:text-xl font-medium text-gray-800">
        {activeTab === "parent" ? t("parent.intro") : t("center.intro")}
      </p>
    </div>
  );
}

function ParentFormSection({
  form,
  onSubmit,
  onCancel,
  isPending,
  t,
}: {
  form: any;
  onSubmit: (data: ParentFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  t: any;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t("form.name")}
          error={form.formState.errors.name}
          t={t}
          required={false}
        >
          <Input
            {...form.register("name")}
            placeholder={t("form.namePlaceholder")}
            className={cn(form.formState.errors.name && "border-destructive")}
          />
        </FormField>

        <FormField
          label={t("form.phone")}
          error={form.formState.errors.phone}
          t={t}
          required={false}
        >
          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                placeholder={t("form.phonePlaceholder")}
                onChange={field.onChange}
                className={cn(
                  form.formState.errors.phone && "border-destructive"
                )}
              />
            )}
          />
        </FormField>

        <div className="space-y-4">
          <FormField
            label={t("form.kindOfUser")}
            error={form.formState.errors.kind_of_user}
            t={t}
            required={false}
          >
            <Controller
              name="kind_of_user"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.kind_of_user && "border-destructive"
                    )}
                  >
                    <SelectValue
                      placeholder={t("form.kindOfUserPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">
                      {t("form.kindOptions.parent")}
                    </SelectItem>
                    <SelectItem value="teacher">
                      {t("form.kindOptions.teacher")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("form.kindOptions.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {form.watch("kind_of_user") === "other" && (
            <Input
              {...form.register("kind_of_user_other")}
              placeholder={
                t("form.kindOfUserOtherPlaceholder") || "Please specify"
              }
              className="mt-2"
            />
          )}
        </div>

        <FormField
          label={t("form.email")}
          error={form.formState.errors.email}
          t={t}
          required={false}
        >
          <Input
            {...form.register("email")}
            type="email"
            placeholder={t("form.emailPlaceholder")}
            className={cn(form.formState.errors.email && "border-destructive")}
          />
        </FormField>

        <div className="space-y-4">
          <FormField
            label={t("form.subject")}
            error={form.formState.errors.subject_of_consultation}
            t={t}
            required={false}
          >
            <Controller
              name="subject_of_consultation"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.subject_of_consultation &&
                        "border-destructive"
                    )}
                  >
                    <SelectValue placeholder={t("form.subjectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">
                      {t("form.subjectOptions.educational")}
                    </SelectItem>
                    <SelectItem value="psychological">
                      {t("form.subjectOptions.psychological")}
                    </SelectItem>
                    <SelectItem value="behavioral">
                      {t("form.subjectOptions.behavioral")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("form.subjectOptions.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {form.watch("subject_of_consultation") === "other" && (
            <Input
              {...form.register("subject_of_consultation_other")}
              placeholder={
                t("form.subjectOtherPlaceholder") || "Please specify"
              }
              className="mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("form.file")}
          </label>
          <Controller
            name="file"
            control={form.control}
            render={({ field }) => (
              <FileUploader
                value={field.value}
                onChange={field.onChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            )}
          />
        </div>
      </div>

      <FormField
        label={t("form.description")}
        error={form.formState.errors.description}
        t={t}
        required={true}
      >
        <Textarea
          {...form.register("description")}
          placeholder={t("form.descriptionPlaceholder")}
          rows={10}
          className={cn(
            form.formState.errors.description && "h-36 border-destructive"
          )}
        />
      </FormField>

      <FormButtons onCancel={onCancel} isPending={isPending} t={t} />
    </form>
  );
}

function CenterFormSection({
  form,
  onSubmit,
  onCancel,
  isPending,
  t,
}: {
  form: any;
  onSubmit: (data: CenterFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  t: any;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label={t("form.centerName")}
          error={form.formState.errors.center_name}
          t={t}
          required={false}
        >
          <Input
            {...form.register("center_name")}
            placeholder={t("form.centerNamePlaceholder")}
            className={cn(
              form.formState.errors.center_name && "border-destructive"
            )}
          />
        </FormField>

        <div className="space-y-4">
          <FormField
            label={t("form.centerSpec")}
            error={form.formState.errors.center_specification}
            t={t}
            required={false}
          >
            <Controller
              name="center_specification"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.center_specification &&
                        "border-destructive"
                    )}
                  >
                    <SelectValue
                      placeholder={t("form.centerSpecPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nursery">
                      {t("form.centerSpecOptions.nursery")}
                    </SelectItem>
                    <SelectItem value="educational">
                      {t("form.centerSpecOptions.educational")}
                    </SelectItem>
                    <SelectItem value="rehabilitation">
                      {t("form.centerSpecOptions.rehabilitation")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("form.centerSpecOptions.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {form.watch("center_specification") === "other" && (
            <Input
              {...form.register("center_specification_other")}
              placeholder={
                t("form.centerSpecOtherPlaceholder") || "Please specify"
              }
              className="mt-2"
            />
          )}
        </div>

        <FormField
          label={t("form.requesterName")}
          error={form.formState.errors.name_of_consultan_request}
          t={t}
          required={false}
        >
          <Input
            {...form.register("name_of_consultan_request")}
            placeholder={t("form.requesterNamePlaceholder")}
            className={cn(
              form.formState.errors.name_of_consultan_request &&
                "border-destructive"
            )}
          />
        </FormField>

        <FormField
          label={t("form.requesterMission")}
          error={form.formState.errors.mission_of_consultant_request}
          t={t}
          required={false}
        >
          <Input
            {...form.register("mission_of_consultant_request")}
            placeholder={t("form.requesterMissionPlaceholder")}
            className={cn(
              form.formState.errors.mission_of_consultant_request &&
                "border-destructive"
            )}
          />
        </FormField>

        <FormField
          label={t("form.phone")}
          error={form.formState.errors.phone}
          t={t}
          required={false}
        >
          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                placeholder={t("form.phonePlaceholder")}
                onChange={field.onChange}
                className={cn(
                  form.formState.errors.phone && "border-destructive"
                )}
              />
            )}
          />
        </FormField>

        <FormField
          label={t("form.email")}
          error={form.formState.errors.email}
          t={t}
          required={false}
        >
          <Input
            {...form.register("email")}
            type="email"
            placeholder={t("form.emailPlaceholder")}
            className={cn(form.formState.errors.email && "border-destructive")}
          />
        </FormField>

        <div className="space-y-4">
          <FormField
            label={t("form.subject")}
            error={form.formState.errors.subject_of_consultan}
            t={t}
            required={false}
          >
            <Controller
              name="subject_of_consultan"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.subject_of_consultan &&
                        "border-destructive"
                    )}
                  >
                    <SelectValue placeholder={t("form.subjectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">
                      {t("form.subjectOptions.educational")}
                    </SelectItem>
                    <SelectItem value="administrative">
                      {t("form.subjectOptions.administrative")}
                    </SelectItem>
                    <SelectItem value="technical">
                      {t("form.subjectOptions.technical")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("form.subjectOptions.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {form.watch("subject_of_consultan") === "other" && (
            <Input
              {...form.register("subject_of_consultan_other")}
              placeholder={
                t("form.subjectOtherPlaceholder") || "Please specify"
              }
              className="mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("form.file")}
          </label>
          <Controller
            name="file"
            control={form.control}
            render={({ field }) => (
              <FileUploader
                value={field.value}
                onChange={field.onChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            )}
          />
        </div>
      </div>

      <FormField
        label={t("form.description")}
        error={form.formState.errors.description}
        t={t}
        required={true}
      >
        <Textarea
          {...form.register("description")}
          placeholder={t("form.descriptionPlaceholder")}
          rows={10}
          className={cn(
            form.formState.errors.description && "h-36 border-destructive"
          )}
        />
      </FormField>

      <FormButtons onCancel={onCancel} isPending={isPending} t={t} />
    </form>
  );
}

function EducationCarousel({
  guides,
  selectedIndex,
  setSelectedIndex,
  multiplier,
  t,
}: {
  guides: any[];
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  multiplier: number;
  t: any;
}) {
  return (
    <div className="mt-16 md:mt-24">
      <h2 className="text-3xl md:text-4xl font-bold text-primary-blue text-center mb-12">
        {t("tipsTitle")}
      </h2>

      <div className="relative h-[400px] md:h-[608px] overflow-hidden px-6 md:px-12 lg:px-20">
        <div className="absolute inset-0 flex items-center justify-center">
          {guides.map((tip, index) => {
            const totalItems = guides.length;
            let distance = index - selectedIndex;
            if (distance > totalItems / 2) distance -= totalItems;
            if (distance < -totalItems / 2) distance += totalItems;

            const absDistance = Math.abs(distance);
            const isActive = distance === 0;

            if (absDistance > 3) return null;

            const zIndex = 40 - absDistance;
            const scale = isActive ? 1 : 0.85 - absDistance * 0.05;
            const translateX = distance * multiplier;
            const rotateY = distance * -3;

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="absolute transition-all duration-500 ease-out cursor-pointer focus:outline-none"
                style={{
                  zIndex,
                  transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                }}
              >
                <div
                  className={cn(
                    "w-[260px] sm:w-[320px] md:w-[480px] lg:w-[540px] rounded-3xl border py-11 px-4 sm:px-6 md:px-8 flex flex-col items-center text-center transition-all duration-500",
                    isActive
                      ? "border-secondary-mint-green bg-white bg-linear-to-b from-white/15 via-secondary-mint-green/12 to-secondary-mint-green/24"
                      : "bg-white border-light-gray"
                  )}
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-64 md:h-64 lg:w-80 lg:h-80 mb-3 sm:mb-4 md:mb-6 pointer-events-none">
                    <Image
                      src={tip.image}
                      alt={tip.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="max-w-[400px] text-xl md:text-2xl lg:text-[2rem] text-primary-blue mb-2 sm:mb-3 md:mb-4 leading-tight">
                    {tip.title}
                  </h3>
                  <p className="max-w-[400px] text-sm md:text-base lg:text-xl font-normal">
                    {tip.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Helper UI Components ---

function FormField({
  label,
  error,
  children,
  t,
  required,
}: {
  label: string;
  error?: any;
  children: React.ReactNode;
  t: any;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive">
          {t(`form.errors.${error.message}`)}
        </p>
      )}
    </div>
  );
}

function FormButtons({
  onCancel,
  isPending,
  t,
}: {
  onCancel: () => void;
  isPending: boolean;
  t: any;
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 pt-4">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onCancel}
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
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {t("form.submitting")}
          </>
        ) : (
          t("form.submit")
        )}
      </Button>
    </div>
  );
}
