"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2, UserPlus, X, Ticket, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DateTimePicker from "@/components/general/DateTimePicker";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { getBranchPricingAction } from "@/actions/nurseryActions";
import {
  parentService as dashboardParentService,
  promoCodeService,
  ApplyPromoCodeResponse,
} from "@/services/dashboardApi";
import { enrollmentService } from "@/services/api";
import { useAuthUser, useAuthStore } from "@/store/authStore";
import { toastSuccess, toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import ProgramCard from "@/app/[locale]/(website)/establishments/_components/ProgramCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminOption } from "@/types";

// --- Types & Interfaces ---

interface ReservationFormProps {
  nurseryName: string;
  selectedProgram: string;
  locale: "ar" | "en";
  tNamespace?: "nurseryDetails" | "centerDetails";
  selectedBranch?: string;
  selectedPlan?: string;
  onClose?: () => void;
  preSelectedPlanId?: number | string;
  showOnlySelectedPlan?: boolean;
  adminOptions?: AdminOption[];
}

type PlanType = "monthly" | "weekly" | "daily" | "hourly";

interface Plan {
  id: number;
  type: PlanType;
  name: string;
  price: string;
  planId: number;
  durationLabel?: string;
}

interface ApiPlan {
  id: number;
  title: string;
  start_age: number | { type: string; age: number };
  end_age: number | { type: string; age: number };
  count: number;
  enrollment_type: string;
  price_amount: number;
}

// --- Constants ---

// --- Sub-Components ---

const NotesSection = ({ locale }: { locale: "ar" | "en" }) => {
  const t = useTranslations("reservationForm.labels");
  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="text-base font-normal text-primary mb-2">{t("notes")}</h4>
      <ul className="font-medium text-mid-gray list-disc list-inside">
        <li>{t("note1")}</li>
        <li>{t("note2")}</li>
        <li>{t("note3")}</li>
      </ul>
    </div>
  );
};

const SuccessView = ({
  locale,
  onClose,
  onDashboard,
}: {
  locale: "ar" | "en";
  onClose: () => void;
  onDashboard: () => void;
}) => {
  const t = useTranslations("reservationForm.success");
  const tLabels = useTranslations("reservationForm.labels");

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 60 }}
      className="bg-white rounded-xl shadow-lg p-8 text-center"
    >
      <div className="mb-6 flex justify-center">
        <Image
          src="/assets/illustrations/success.png"
          alt="Success"
          width={160}
          height={160}
          className="mx-auto"
        />
      </div>
      <h2 className="text-2xl font-bold text-primary mb-4">
        {tLabels("successTitle")}
      </h2>
      <p className="text-gray-600 mb-6">{tLabels("successDesc")}</p>
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-6">
        <button
          onClick={onClose}
          className="px-6 py-2 font-bold rounded-lg transition w-full sm:w-auto
            bg-primary text-white shadow hover:bg-[#3646a5] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {tLabels("submitAnother")}
        </button>
        <button
          onClick={onDashboard}
          className="px-6 py-2 font-bold rounded-lg transition w-full sm:w-auto
            border-2 border-primary text-primary bg-white hover:bg-[#f7f8fa] hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {tLabels("goToReservations")}
        </button>
      </div>
    </motion.div>
  );
};

const PlanSelection = ({
  plans,
  selectedPlanId,
  onSelect,
  showOnlySelected,
  locale,
}: {
  plans: Plan[];
  selectedPlanId: string | number;
  onSelect: (id: string | number) => void;
  showOnlySelected: boolean;
  locale: "ar" | "en";
}) => {
  const t = useTranslations("reservationForm.labels");
  const visiblePlans = showOnlySelected
    ? plans.filter(
        (p) => p.id === selectedPlanId || p.planId === selectedPlanId,
      )
    : plans;

  if (showOnlySelected && visiblePlans.length > 0) {
    const p = visiblePlans[0];
    return (
      <div>
        <p className="font-bold mb-6 text-primary text-base">{t("program")}</p>
        <ProgramCard
          title={p.name}
          durationLabel={p.durationLabel || p.name}
          price={parseFloat(p.price.replace(/[^\d.]/g, "") || "0")}
          isSelected={true}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "flex gap-4 mb-6",
        showOnlySelected
          ? "justify-center items-center"
          : "overflow-x-auto pb-2 custom-scrollbar justify-start",
        plans.length <= 4 &&
          !showOnlySelected &&
          "flex-row justify-center items-center",
      )}
      style={{
        maxWidth: showOnlySelected || plans.length > 4 ? "100%" : "48rem",
        margin: "0 auto",
        padding: showOnlySelected ? "8px 0" : "8px 8px",
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 60 }}
    >
      {visiblePlans.map((p) => {
        const isSelected =
          selectedPlanId === p.id || selectedPlanId === p.planId;

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => !showOnlySelected && onSelect(p.id)}
            disabled={showOnlySelected}
            className={cn(
              "flex flex-col items-center py-3 px-4 rounded-xl border-2 transition font-bold text-base",
              showOnlySelected
                ? ""
                : plans.length > 4
                  ? "min-w-[120px] shrink-0"
                  : "flex-1",
              isSelected
                ? "bg-primary text-white border-primary shadow border-dashed outline-dashed outline-2 outline-primary"
                : "bg-[#F7F8FA] text-gray-700 border-gray-300 border-solid focus:outline-none",
              showOnlySelected && "cursor-default",
            )}
            tabIndex={showOnlySelected ? -1 : 0}
          >
            <span
              className={cn(
                "text-lg font-extrabold mb-1 flex flex-col items-center",
                isSelected ? "text-white" : "text-primary",
              )}
            >
              {p.price.toString().replace(/[^\d.]/g, "")}
              <span
                className={cn(
                  "sar text-2xl",
                  isSelected ? "text-white" : "text-primary",
                )}
              >
                $
              </span>
            </span>
            <span className="w-full h-px bg-[#DADADA] mb-1" />
            <span
              className={cn(
                "text-base font-bold",
                isSelected ? "text-white" : "text-primary",
              )}
            >
              {p.name}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
};

const ChildSelection = ({
  children,
  selectedIds,
  onSelect,
  isLoading,
  error,
  locale,
  router,
}: {
  children: any[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  isLoading: boolean;
  error: any;
  locale: "ar" | "en";
  router: any;
}) => {
  const t = useTranslations("reservationForm.labels");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4, type: "spring", stiffness: 60 }}
    >
      <p className="font-bold mb-6 text-primary">{t("selectChildren")}</p>
      <div
        className="flex gap-4 justify-start overflow-x-auto pb-2 custom-scrollbar max-w-3xl mx-auto"
        style={{
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <motion.div
              key={idx}
              className="rounded-lg border-2 border-gray-200 bg-white min-w-[110px] w-24 h-32 md:min-w-[120px] md:w-28 md:h-36 flex flex-col items-center justify-start shrink-0 p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Skeleton className="w-16 h-16 rounded-full mt-2 mb-3" />
              <Skeleton className="w-16 h-4 rounded mb-2" />
              <Skeleton className="w-10 h-3 rounded" />
            </motion.div>
          ))}

        {!isLoading && error && (
          <div
            onClick={() => router.push(`/${locale}/dashboard/parent/children`)}
            className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-dashed min-w-[110px] w-24 h-32 md:min-w-[120px] md:w-28 md:h-36 bg-blue-50 border-blue-300 mx-auto cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition-all shrink-0"
          >
            <div className="w-16 h-16 flex items-center justify-center mb-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <span className="text-sm text-blue-700 font-bold text-center mt-1">
              {t("youHaveNoChildren")}
            </span>
          </div>
        )}

        {!isLoading &&
          !error &&
          children &&
          children.length > 0 &&
          children.map((child: any, idx: number) => {
            const idStr = (
              child.id ??
              child.child_id ??
              child._id ??
              `${idx}`
            ).toString();
            const gender = (child.gender || child.sex || "")
              .toString()
              .toLowerCase();
            const nameAr = child.child_name || child.name || child.nameAr;
            const nameEn =
              child.nameEn || child.name_en || child.name || nameAr;
            const displayName =
              locale === "ar" ? nameAr || nameEn : nameEn || nameAr;

            return (
              <motion.button
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.08,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 60,
                }}
                type="button"
                key={idStr}
                onClick={() => onSelect(idStr)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg border-2 transition min-w-[110px] w-24 h-32 md:min-w-[120px] md:w-28 md:h-36 justify-start shrink-0",
                  selectedIds.includes(idStr)
                    ? "border-primary shadow bg-white"
                    : "border-gray-300 bg-white",
                  "focus:outline-none hover:shadow-lg",
                )}
              >
                <div className="w-20 h-20 flex items-center justify-center mb-2 mt-2 transition-all duration-200">
                  <Image
                    src={
                      gender === "boy" || gender === "male"
                        ? "/assets/illustrations/boy.png"
                        : "/assets/illustrations/girl.png"
                    }
                    alt={(displayName || "Child").toString()}
                    width={64}
                    height={64}
                    style={{
                      objectFit: "contain",
                      filter: selectedIds.includes(idStr)
                        ? "none"
                        : "grayscale(100%) brightness(0.8)",
                      transform: selectedIds.includes(idStr)
                        ? "scale(1.1)"
                        : "scale(1)",
                      transition: "all 0.2s",
                    }}
                  />
                </div>
                <span
                  className={cn(
                    "font-bold text-sm text-center mt-1 line-clamp-2 w-full",
                    selectedIds.includes(idStr)
                      ? "text-primary"
                      : "text-gray-600",
                  )}
                >
                  {displayName}
                </span>
              </motion.button>
            );
          })}

        {!isLoading && !error && children && children.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 min-w-full text-center">
            <Image
              src="/assets/illustrations/empty.png"
              alt="No children"
              width={120}
              height={120}
              className="mb-4 opacity-50"
            />
            <h3 className="text-lg font-bold text-primary mb-2">
              {t("noChildren")}
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              {t("noChildrenDesc")}
            </p>
            <Button
              type="button"
              onClick={() =>
                router.push(`/${locale}/dashboard/parent/children`)
              }
              className="mt-4 bg-primary hover:bg-[#3646a5] text-white"
            >
              {t("addNewChild")}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const BookingSummary = ({
  locale,
  planName,
  fromTime,
  toTime,
  childrenCount,
  date,
  price,
  promoDetails,
  couponProps,
  showTime,
}: {
  locale: "ar" | "en";
  planName: string;
  fromTime: string;
  toTime: string;
  childrenCount: number;
  date: string;
  price: string;
  promoDetails: ApplyPromoCodeResponse | null;
  couponProps: {
    couponCode: string;
    setCouponCode: (code: string) => void;
    onApply: () => void;
    onRemove: () => void;
    isApplying: boolean;
    error: string | null;
  };
  showTime?: boolean;
}) => {
  const t = useTranslations("reservationForm.summary");
  const tLabels = useTranslations("reservationForm.labels");

  const numericPrice = parseFloat(price.replace(/[^\d.]/g, "") || "0");
  const subtotal = numericPrice * childrenCount;

  // Calculate final total based on whether promo is applied
  const finalTotal = promoDetails ? promoDetails.final_amount : subtotal;
  const currencySymbol = <span className="sar text-2xl">$</span>;

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-base text-primary mb-4">
        {tLabels("bookingSummary")}
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-base">
          <span className="text-mid-gray font-medium">
            {tLabels("program")}
          </span>
          <span className="text-mid-gray font-medium">{planName || "-"}</span>
        </div>
        <div className="flex justify-between items-center text-base">
          <span className="text-mid-gray font-medium">
            {showTime ? tLabels("startTime") : tLabels("startDate")}
          </span>
          <span className="text-mid-gray font-medium" dir="ltr">
            {date
              ? format(new Date(date), "EEEE yyyy/MM/dd", {
                  locale: locale === "ar" ? ar : undefined,
                })
              : "-"}
            {showTime && ` ${fromTime}`}
          </span>
        </div>
        <div className="flex justify-between items-center text-base">
          <span className="text-mid-gray font-medium">
            {tLabels("duration")}
          </span>
          <span className="text-mid-gray font-medium">{toTime || "-"}</span>
        </div>
        <div className="flex justify-between items-center text-base">
          <span className="text-mid-gray font-medium">
            {tLabels("paymentMethod")}
          </span>
          <span className="text-mid-gray font-medium">
            {tLabels("paymentMayser")}
          </span>
        </div>
        <div className="flex justify-between items-center text-base pt-3 border-t border-dashed border-gray-200">
          <span className="text-mid-gray font-medium">
            {tLabels("required")}
          </span>
          <span className="text-mid-gray font-bold flex items-center gap-1">
            {subtotal} {currencySymbol}
          </span>
        </div>

        {/* Coupon Entry Section */}
        <div className="pb-2">
          {!promoDetails ? (
            <>
              <p className="text-mid-gray font-medium mb-3">
                {tLabels("discountCoupon")}
              </p>
              <div className="flex gap-2 items-center">
                <Input
                  value={couponProps.couponCode}
                  onChange={(e) => couponProps.setCouponCode(e.target.value)}
                  placeholder={
                    locale === "ar" ? "مثال: night15" : "Example: night15"
                  }
                  className={cn(
                    "flex-1 h-12 rounded-xl text-center border-gray-200 focus-visible:ring-primary/20",
                    couponProps.error ? "border-red-300 bg-red-50" : "",
                  )}
                />

                <Button
                  type="button"
                  size="sm"
                  onClick={couponProps.onApply}
                  disabled={
                    couponProps.isApplying || !couponProps.couponCode.trim()
                  }
                >
                  {couponProps.isApplying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    tLabels("tryCoupon")
                  )}
                </Button>
              </div>
              {couponProps.error && (
                <p className="text-red-500 text-xs mt-1 text-center">
                  {couponProps.error}
                </p>
              )}
              <p className="text-[12px] text-info flex items-center justify-center gap-1 mt-4 leading-tight font-medium">
                <Ticket size={14} className="shrink-0" />
                {tLabels("paymentNotice")}
              </p>
            </>
          ) : (
            <div className="flex justify-between items-center text-base">
              <span className="text-mid-gray font-medium">
                {tLabels("discountCoupon")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-info font-bold">
                  {promoDetails.promo_code}
                </span>
                <button
                  type="button"
                  onClick={couponProps.onRemove}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-secondary-mint-green mt-6 pt-4 space-y-4">
        {promoDetails && (
          <div className="flex justify-between items-center text-base">
            <span className="text-mid-gray font-medium">
              {tLabels("discount")}
            </span>
            <span className="text-mid-gray font-medium flex items-center gap-1">
              {promoDetails.discount} {currencySymbol}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-bold text-primary">
            {tLabels("totalAfterDiscount")}
          </span>
          <span className="font-extrabold text-2xl text-primary flex items-center gap-1">
            {finalTotal > 0 ? finalTotal.toFixed(0) : "0"} {currencySymbol}
          </span>
        </div>
      </div>
    </div>
  );
};

const FacilitiesSelection = ({
  locale,
  options,
  selectedIds,
  onToggle,
}: {
  locale: "ar" | "en";
  options: AdminOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) => {
  if (options.length === 0) return null;

  const title =
    locale === "ar"
      ? "اختر المرافق المسموح بها لطفلك"
      : "Choose the facilities available to your child";

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 60 }}
      className="py-6"
    >
      <h3 className="mb-6 text-base font-bold text-primary">{title}</h3>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,max-content))] justify-between gap-x-6 gap-y-1">
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          const title =
            typeof option.title === "string"
              ? option.title
              : option.title[locale] || option.title.ar;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className={cn(
                "flex w-full min-w-0 items-center justify-start gap-2 text-start transition",
                "cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary-mint-green/40",
              )}
            >
              <div
                className={cn(
                  "min-w-4 h-4 rounded-full border transition-colors flex items-center justify-center",
                  isSelected
                    ? "bg-secondary-mint-green border-secondary-mint-green text-white"
                    : "border-gray-300 bg-white",
                )}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-3" />}
              </div>

              <div className="relative h-5 w-5 shrink-0">
                <Image
                  src={option.image}
                  alt={title}
                  fill
                  className="object-contain"
                />
              </div>

              <span className="min-w-0 whitespace-nowrap text-sm font-medium text-mid-gray">
                {title}
              </span>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
};

// --- Main Component ---

const ReservationForm = ({
  nurseryName,
  selectedProgram,
  locale,
  tNamespace = "nurseryDetails",
  selectedBranch,
  selectedPlan,
  onClose,
  preSelectedPlanId,
  showOnlySelectedPlan = false,
  adminOptions = [],
}: ReservationFormProps) => {
  const t = useTranslations("reservationForm");
  const tPlanCommon = useTranslations(`${tNamespace}.plans` as any);
  const router = useRouter();
  const searchParams = typeof window !== "undefined" ? useSearchParams() : null;
  const authUser = typeof window !== "undefined" ? useAuthUser() : null;

  // -- State --
  const [selectedPlanId, setSelectedPlanId] = useState<string | number>(
    preSelectedPlanId || 4,
  );
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [selectedAdminOptions, setSelectedAdminOptions] = useState<number[]>(
    adminOptions.map((option) => option.id),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Coupon State using API definition
  const [couponCode, setCouponCode] = useState<string>("");
  const [promoDetails, setPromoDetails] =
    useState<ApplyPromoCodeResponse | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [submitSuccess, setSubmitSuccess] = useState(
    typeof window !== "undefined" && searchParams?.get("payment") === "success",
  );

  // -- Queries --
  const { data: apiPlans = [] } = useQuery({
    queryKey: ["branch-plans", selectedBranch],
    queryFn: () => getBranchPricingAction(selectedBranch!),
    enabled: !!selectedBranch && selectedBranch !== "",
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: realChildren = [],
    isLoading: isChildrenLoading,
    error: childrenError,
  } = useQuery({
    queryKey: ["parent-children"],
    queryFn: () => dashboardParentService.getParentChildren(),
    enabled: !submitSuccess && !!authUser,
    staleTime: 5 * 60 * 1000,
  });

  // Debug logging for children data
  useEffect(() => {
    console.log("[ReservationForm] Children query state:", {
      isLoading: isChildrenLoading,
      hasError: !!childrenError,
      error: childrenError,
      childrenCount: realChildren?.length,
      children: realChildren,
      authUser: !!authUser,
      submitSuccess,
      queryEnabled: !submitSuccess && !!authUser,
    });
  }, [realChildren, isChildrenLoading, childrenError, authUser, submitSuccess]);

  // -- Derived Data --
  const getDurationLabel = (count: number, type: string) => {
    if (tNamespace === "centerDetails") {
      return tPlanCommon("sessionCount", { count });
    }

    const unitLabel =
      tPlanCommon(`units.${count === 1 ? type : `${type}s`}`) || type;
    return `${count} ${unitLabel}`;
  };

  const defaultPlans: Plan[] = useMemo(() => {
    return [
      {
        id: 1,
        type: "monthly",
        name: t("plans.monthly"),
        price: "50",
        planId: 1,
      },
      {
        id: 2,
        type: "weekly",
        name: t("plans.weekly"),
        price: "50",
        planId: 2,
      },
      {
        id: 3,
        type: "daily",
        name: t("plans.daily"),
        price: "50",
        planId: 3,
      },
      {
        id: 4,
        type: "hourly",
        name: t("plans.hourly"),
        price: "50",
        planId: 4,
      },
    ];
  }, [locale, t]);

  const planList: Plan[] = useMemo(() => {
    if (apiPlans.length > 0) {
      return apiPlans.map((apiPlan: ApiPlan) => ({
        id: apiPlan.id,
        type: apiPlan.enrollment_type as PlanType,
        name: apiPlan.title,
        price: `${apiPlan.price_amount}`,
        planId: apiPlan.id,
        durationLabel: getDurationLabel(apiPlan.count, apiPlan.enrollment_type),
      }));
    }
    if (!selectedBranch) return defaultPlans;
    return [];
  }, [apiPlans, selectedBranch, defaultPlans, getDurationLabel]);

  const selectedPlanObj = useMemo(
    () =>
      planList.find(
        (p) => p.id === selectedPlanId || p.planId === selectedPlanId,
      ),
    [planList, selectedPlanId],
  );

  const selectedApiPlan = useMemo(
    () => apiPlans.find((plan: ApiPlan) => plan.id === selectedPlanId),
    [apiPlans, selectedPlanId],
  );

  // -- Effects --

  // Initial Plan Selection Logic
  useEffect(() => {
    if (planList.length > 0 && !hasInitialized) {
      let foundPlanId = selectedPlanId;
      const queryPlanId = searchParams?.get("plan");

      const findIdByNameOrType = (val: string) => {
        const found = planList.find(
          (p) =>
            p.name === val ||
            p.type === val ||
            p.name.toLowerCase() === val.toLowerCase(),
        );
        return found?.id;
      };

      if (queryPlanId) {
        const planFromQuery = planList.find(
          (p) =>
            p.id === Number(queryPlanId) || p.planId === Number(queryPlanId),
        );
        if (planFromQuery) foundPlanId = planFromQuery.id;
      } else if (preSelectedPlanId) {
        foundPlanId = preSelectedPlanId;
      } else if (selectedPlan) {
        foundPlanId = findIdByNameOrType(selectedPlan) || foundPlanId;
      } else if (selectedProgram) {
        foundPlanId = findIdByNameOrType(selectedProgram) || foundPlanId;
      } else if (!selectedPlanId && planList[0]) {
        foundPlanId = planList[0].id;
      }

      if (foundPlanId && foundPlanId !== selectedPlanId) {
        setSelectedPlanId(foundPlanId);
      }
      setHasInitialized(true);
    }
  }, [
    planList,
    selectedPlan,
    selectedProgram,
    hasInitialized,
    selectedPlanId,
    preSelectedPlanId,
    searchParams,
  ]);

  // Auto-set time options based on plan
  useEffect(() => {
    if (selectedApiPlan) {
      const { enrollment_type, count } = selectedApiPlan;

      switch (enrollment_type) {
        case "hour":
          setFromTime("08:00");
          setToTime(getDurationLabel(count, enrollment_type));
          break;
        case "day":
        case "week":
        case "month":
        case "year":
          setFromTime("09:00");
          setToTime(getDurationLabel(count, enrollment_type));
          break;
        default:
          setFromTime("");
          setToTime("");
      }
    } else {
      setFromTime("");
      setToTime("");
    }
  }, [selectedPlanId, selectedApiPlan, getDurationLabel]);

  // Restore Auth after success redirect
  useEffect(() => {
    if (submitSuccess && typeof window !== "undefined") {
      try {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          if (authData?.state?.token && authData?.state?.user) {
            useAuthStore
              .getState()
              .setUserToken(authData.state.user, authData.state.token);
          }
        }
      } catch (e) {
        console.error("Error restoring auth:", e);
      }
    }
  }, [submitSuccess]);

  useEffect(() => {
    setSelectedAdminOptions(adminOptions.map((option) => option.id));
  }, [adminOptions]);

  // -- Handlers --

  const handleApplyCoupon = async () => {
    setCouponError(null);
    if (!couponCode.trim()) {
      setCouponError(t("errors.enterCoupon"));
      return;
    }
    if (!selectedBranch) {
      toastError(t("errors.selectBranch"));
      return;
    }
    if (!selectedPlanId) {
      toastError(t("errors.selectPlan"));
      return;
    }
    if (selectedChildren.length === 0) {
      setCouponError(t("errors.selectChild"));
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await promoCodeService.applyPromoCode({
        branch_price_id: Number(selectedPlanId),
        branch_id: Number(selectedBranch),
        promo_code: couponCode.trim().toUpperCase(),
        child_count: selectedChildren.length,
      });

      setPromoDetails(response);
      toastSuccess(t("success.couponApplied"));
    } catch (error: any) {
      console.error("Coupon error:", error);
      let errorMessage = t("errors.failedToApply");

      const hasValidationErrors =
        error?.errors && Object.keys(error.errors).length > 0;

      if (error?.message?.toLowerCase().includes("usage limit")) {
        errorMessage = t("errors.usageLimit");
      } else if (error?.message?.toLowerCase().includes("expired")) {
        errorMessage = t("errors.expiredCoupon");
      } else if (
        error?.message?.toLowerCase().includes("invalid") ||
        error?.message?.toLowerCase().includes("not found") ||
        error?.status === 404
      ) {
        errorMessage = t("errors.invalidCoupon");
      } else if (hasValidationErrors) {
        if (error.errors.child_count) {
          errorMessage = t("errors.childCountRequired");
        } else {
          errorMessage = t("errors.invalidData");
        }
      } else {
        errorMessage = error?.message || errorMessage;
      }
      setCouponError(errorMessage);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setPromoDetails(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleToggleAdminOption = (optionId: number) => {
    const isSelected = selectedAdminOptions.includes(optionId);
    setSelectedAdminOptions(
      isSelected
        ? selectedAdminOptions.filter((id) => id !== optionId)
        : [...selectedAdminOptions, optionId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("[ReservationForm] Form submission started");
    console.log("[ReservationForm] Selected children:", selectedChildren);
    console.log("[ReservationForm] Selected plan:", selectedPlanObj);
    console.log("[ReservationForm] Selected branch:", selectedBranch);
    console.log("[ReservationForm] Auth user:", authUser);

    const planId = selectedPlanObj?.planId;
    if (!planId) {
      console.error("[ReservationForm] No plan selected");
      toastError(t("errors.noPlanSelected"));
      setIsSubmitting(false);
      return;
    }
    if (!selectedBranch) {
      console.error("[ReservationForm] No branch selected");
      toastError(t("errors.noBranchSelected"));
      setIsSubmitting(false);
      return;
    }

    const phone =
      (authUser as any)?.phone || (authUser as any)?.user?.phone || "";
    console.log("[ReservationForm] Parent phone:", phone);

    try {
      const enrollmentPayload: any = {
        center_branch_id: Number(selectedBranch),
        branch_price_id: Number(planId),
        parent_phone: phone,
        children: selectedChildren.map((id) => Number(id)),
        admin_options: selectedAdminOptions,
      };

      if (promoDetails && promoDetails.promo_code) {
        enrollmentPayload.title = promoDetails.promo_code;
      }

      if (selectedApiPlan?.enrollment_type === "hour") {
        enrollmentPayload.day_string = bookingDate;
        enrollmentPayload.starting_time = fromTime || "09:00";
      } else if (bookingDate) {
        if (tNamespace === "centerDetails") {
          enrollmentPayload.day_string = bookingDate;
        } else {
          enrollmentPayload.starting_date = bookingDate;
        }
      }

      console.log("[ReservationForm] Enrollment payload:", enrollmentPayload);

      const result =
        await enrollmentService.createEnrollment(enrollmentPayload);
      console.log("[ReservationForm] Enrollment created successfully:", result);

      setIsSubmitting(false);
      setSubmitSuccess(true);
      toastSuccess(t("success.bookingSent"));
    } catch (err: any) {
      console.error("[ReservationForm] Booking error:", err);
      console.error("[ReservationForm] Error details:", {
        message: err?.message,
        data: err?.data,
        error: err?.error,
        status: err?.status,
        errors: err?.errors,
      });
      setIsSubmitting(false);

      const errorTitle = t("errors.bookingError");
      let errorDescription = t("errors.submissionFailed");

      if (err?.data?.error) errorDescription = err.data.error;
      else if (err?.error) errorDescription = err.error;
      else if (err?.message) errorDescription = err.message;

      toastError(errorTitle, errorDescription);
    }
  };

  const handleDashboardRedirect = () => {
    const dashboardReservationsUrl = `/${locale}/dashboard/parent/bookings`;
    const loginUrl = `/${locale}/(website)/(auth)/sign-in?redirect=${encodeURIComponent(
      dashboardReservationsUrl,
    )}`;

    if (authUser) {
      router.push(dashboardReservationsUrl);
    } else {
      // Try to recover session or redirect to login
      try {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          if (authData?.state?.token) {
            router.push(dashboardReservationsUrl);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      router.push(loginUrl);
    }
  };

  // -- Render --

  if (submitSuccess) {
    return (
      <SuccessView
        locale={locale}
        onClose={() => setSubmitSuccess(false)}
        onDashboard={handleDashboardRedirect}
      />
    );
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <>
      <motion.form
        id="reservation-form"
        onSubmit={handleSubmit}
        dir={dir}
        className="space-y-8 pb-4"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 60 }}
      >
        {/* Layout Grid */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Right Column (Main Form) */}
          <div className="lg:col-span-6 order-2 lg:order-1 space-y-6">
            <PlanSelection
              plans={planList}
              selectedPlanId={selectedPlanId}
              onSelect={setSelectedPlanId}
              showOnlySelected={showOnlySelectedPlan}
              locale={locale}
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="block mb-2 text-base text-mid-gray">
                {t("labels.startTime")}
              </label>
              <DateTimePicker
                standalone
                allowFuture
                dateValue={bookingDate ? new Date(bookingDate) : undefined}
                timeValue={fromTime}
                onDateChange={(date) =>
                  setBookingDate(date ? format(date, "yyyy-MM-dd") : "")
                }
                onTimeChange={(time) => setFromTime(time)}
                showTime={
                  selectedPlanObj?.type === "hourly" ||
                  selectedApiPlan?.enrollment_type === "hour"
                }
                disabled={(date: Date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                locale={locale}
              />
            </motion.div>

            <ChildSelection
              children={realChildren}
              isLoading={isChildrenLoading}
              error={childrenError}
              selectedIds={selectedChildren}
              onSelect={(id) =>
                setSelectedChildren((prev) =>
                  prev.includes(id)
                    ? prev.filter((c) => c !== id)
                    : [...prev, id],
                )
              }
              locale={locale}
              router={router}
            />

            <FacilitiesSelection
              locale={locale}
              options={adminOptions}
              selectedIds={selectedAdminOptions}
              onToggle={handleToggleAdminOption}
            />
          </div>

          {/* Left Column (Sidebar-like in RTL) */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <BookingSummary
              locale={locale}
              planName={selectedPlanObj?.name || ""}
              fromTime={fromTime}
              toTime={toTime}
              childrenCount={selectedChildren.length}
              date={bookingDate}
              price={selectedPlanObj?.price || ""}
              promoDetails={promoDetails}
              couponProps={{
                couponCode,
                setCouponCode,
                onApply: handleApplyCoupon,
                onRemove: handleRemoveCoupon,
                isApplying: isApplyingCoupon,
                error: couponError,
              }}
              showTime={
                selectedPlanObj?.type === "hourly" ||
                selectedApiPlan?.enrollment_type === "hour"
              }
            />

            <NotesSection locale={locale} />
          </div>
        </div>
      </motion.form>

      {/* Submit Button (Dialog Mode) */}
      <div className="sticky bottom-0 bg-white border-t pt-4 mt-8 -mx-6 px-6 pb-4 z-20">
        <Button
          size="sm"
          type="submit"
          form="reservation-form"
          className="w-full"
          disabled={
            isSubmitting || !bookingDate || selectedChildren.length === 0
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("labels.submitting")}
            </>
          ) : (
            t("labels.confirmBooking")
          )}
        </Button>
      </div>
    </>
  );
};

export default ReservationForm;
