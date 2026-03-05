"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Minus,
  Check,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DatePicker from "@/components/general/DatePicker";
import { adminService } from "@/services/promocodeService";
import { adminService as dashboardAdminService } from "@/services/dashboardApi";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Branch } from "@/types";
import { ListItemSkeleton } from "@/components/loading/LoadingSkeletons";

interface CreatePromocodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  promocodeId?: string | null;
  isViewMode?: boolean;
  onSwitchToEdit?: () => void;
}

const COLORS = [
  "#B12F53", // Rose
  "#D9534F", // Peach
  "#83CBAA", // Sage
  "#2B3990", // Blue
];

const promocodeSchema = z
  .object({
    title: z
      .string()
      .min(1, "Coupon name is required")
      .min(3, "Coupon name must be at least 3 characters")
      .max(50, "Coupon name must not exceed 50 characters")
      .regex(
        /^[a-zA-Z0-9\s\-_]+$/,
        "Coupon name can only contain letters, numbers, spaces, hyphens, and underscores",
      ),
    description: z.string().min(1, "Description is required"),
    percentage: z.number().min(0).max(100),
    start_date: z.date({ required_error: "Start date is required" }),
    end_date: z.date({ required_error: "End date is required" }),
    max_number_of_usage: z.number().min(1),
    amount: z.number().min(0),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

type FormData = z.infer<typeof promocodeSchema>;

interface Center {
  id: number;
  nursery_name: string;
  logo: string;
  branches: Array<{
    id: number;
    name: string;
    nursery_name: string;
  }>;
}

const defaultValues: Partial<FormData> = {
  title: "",
  description: "",
  percentage: 15,
  start_date: undefined,
  end_date: undefined,
  max_number_of_usage: 402,
  amount: 402,
};

export default function CreatePromocodeModal({
  isOpen,
  onClose,
  promocodeId,
  isViewMode = false,
  onSwitchToEdit,
}: CreatePromocodeModalProps) {
  const t = useTranslations("discountCodes.createModal");
  const queryClient = useQueryClient();

  const { data: centersData, isLoading: centersLoading } = useQuery({
    queryKey: ["centers"],
    queryFn: dashboardAdminService.getCenters,
    enabled: isOpen,
  });

  const { data: promocodeData, isLoading: promocodeLoading } = useQuery({
    queryKey: ["promocode", promocodeId],
    queryFn: () =>
      promocodeId
        ? adminService.getPromocode(promocodeId)
        : Promise.resolve(null),
    enabled: !!promocodeId && isOpen,
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCenters, setSelectedCenters] = useState<number[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [allowChildrenOnly, setAllowChildrenOnly] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    COLORS[Math.floor(Math.random() * COLORS.length)],
  );
  const [selectAllCenters, setSelectAllCenters] = useState(false);
  const [selectAllBranches, setSelectAllBranches] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isFormReady, setIsFormReady] = useState(!promocodeId);
  const [activeCenterId, setActiveCenterId] = useState<number | null>(null);
  const [centerSearchQuery, setCenterSearchQuery] = useState("");
  const [branchSearchQuery, setBranchSearchQuery] = useState("");
  const [titleValidation, setTitleValidation] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    message: string;
  }>({ isChecking: false, isValid: null, message: "" });

  const centers: Center[] = centersData || [];

  const form = useForm<FormData>({
    resolver: zodResolver(promocodeSchema),
    defaultValues,
    mode: "onChange",
  });

  // Debounce the title value for validation
  const debouncedTitle = useDebounce(form.watch("title"), 500);

  // Simple title validation effect
  useEffect(() => {
    const validateTitle = async () => {
      // Skip validation for short titles or when editing same title
      if (!debouncedTitle || debouncedTitle.length < 3) {
        setTitleValidation({ isChecking: false, isValid: null, message: "" });
        return;
      }

      if (promocodeId && promocodeData?.data?.title === debouncedTitle) {
        setTitleValidation({ isChecking: false, isValid: true, message: "" });
        return;
      }

      setTitleValidation({ isChecking: true, isValid: null, message: "" });

      try {
        const response =
          await adminService.checkPromocodeExists(debouncedTitle);
        const exists = response?.exists || false;

        setTitleValidation({
          isChecking: false,
          isValid: !exists,
          message: exists
            ? t("titleExists") || "This coupon name already exists"
            : t("titleAvailable") || "Coupon name is available",
        });
      } catch (error) {
        console.error("Title validation error:", error);
        setTitleValidation({ isChecking: false, isValid: null, message: "" });
      }
    };

    validateTitle();
  }, [debouncedTitle, promocodeId, promocodeData, t]);

  const filteredCenters = useMemo(() => {
    if (!centerSearchQuery) return centers;
    return centers.filter((center) =>
      center.nursery_name
        .toLowerCase()
        .includes(centerSearchQuery.toLowerCase()),
    );
  }, [centers, centerSearchQuery]);

  const effectiveActiveCenterId = activeCenterId ?? centers[0]?.id;

  const filteredBranches = useMemo(() => {
    if (!effectiveActiveCenterId) return [];
    const activeCenter = centers.find((c) => c.id === effectiveActiveCenterId);
    const branches = activeCenter ? activeCenter.branches : [];

    if (!branchSearchQuery) return branches;
    return branches.filter((branch) =>
      branch.nursery_name
        .toLowerCase()
        .includes(branchSearchQuery.toLowerCase()),
    );
  }, [centers, effectiveActiveCenterId, branchSearchQuery]);

  const resetForm = () => {
    setStep(1);
    form.reset(defaultValues as FormData);
    setSelectedCenters([]);
    setSelectedBranches([]);
    setAllowChildrenOnly(false);
    setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setStatus("active");
    setActiveCenterId(null);
    setCenterSearchQuery("");
    setBranchSearchQuery("");
  };

  const createMutation = useMutation({
    mutationFn: adminService.createPromocode,
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["promocodes"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || t("error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminService.updatePromocode(promocodeId!, data),
    onSuccess: () => {
      toast.success(t("successUpdate") || "Promocode updated successfully");
      queryClient.invalidateQueries({ queryKey: ["promocodes"] });
      queryClient.invalidateQueries({ queryKey: ["promocode", promocodeId] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || t("error"));
    },
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: "active" | "inactive") =>
      adminService.updateStatus(promocodeId!, { status: newStatus }),
    onSuccess: (_, newStatus) => {
      setStatus(newStatus);
      toast.success(t("statusUpdated") || "Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["promocodes"] });
      queryClient.invalidateQueries({ queryKey: ["promocode", promocodeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("error"));
    },
  });

  useEffect(() => {
    if (isOpen && centersData) {
      if (promocodeId && promocodeData) {
        // Edit Mode: Populate from backend data
        const data = promocodeData.data || promocodeData;
        setStep(1);
        form.reset({
          title: data.title,
          description: data.description || "",
          percentage: Number(data.percentage),
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          max_number_of_usage: Number(data.max_number_of_usage),
          amount: Number(data.amount),
        });
        setAllowChildrenOnly(data.kind_of_child === "new_child");
        setSelectedColor(data.color || COLORS[0]);

        const initialCenterIds =
          data.center_ids?.map(Number) ||
          data.centers?.map((c: any) => c.id) ||
          [];
        const initialBranchIds =
          data.branch_ids?.map(Number) ||
          data.branches?.map((b: any) => b.id) ||
          [];

        // Logic to ensure consistency:
        // 1. If a center is selected, ALL its branches must be selected.
        // 2. If ALL branches of a center are selected, the center must be selected.

        let newSelectedCenters = [...initialCenterIds];
        let newSelectedBranches = [...initialBranchIds];

        // Pass 1: For every selected center, ensure all its branches are selected
        newSelectedCenters.forEach((centerId) => {
          const center = centersData.find((c: Center) => c.id === centerId);
          if (center) {
            const centerBranchIds = center.branches.map((b: Branch) => b.id);
            newSelectedBranches = [
              ...new Set([...newSelectedBranches, ...centerBranchIds]),
            ];
          }
        });

        // Pass 2: For every center, if all its branches are in newSelectedBranches, ensure center is selected
        centersData.forEach((center: Center) => {
          const centerBranchIds = center.branches.map((b) => b.id);
          if (
            centerBranchIds.length > 0 &&
            centerBranchIds.every((id) => newSelectedBranches.includes(id))
          ) {
            if (!newSelectedCenters.includes(center.id)) {
              newSelectedCenters.push(center.id);
            }
          }
        });

        setSelectedCenters(newSelectedCenters);
        setSelectedBranches(newSelectedBranches);

        if (newSelectedCenters.length > 0) {
          setActiveCenterId(newSelectedCenters[0]);
        } else if (initialBranchIds.length > 0) {
          // If no center selected but branches are, find the center of the first branch
          const firstBranchId = initialBranchIds[0];
          const center = centersData.find((c: Center) =>
            c.branches.some((b) => b.id === firstBranchId),
          );
          if (center) setActiveCenterId(center.id);
        }

        setStatus(data.status === "active" ? "active" : "inactive");
        setIsFormReady(true);
      } else if (!promocodeId) {
        // Create Mode: Reset form (includes random color)
        resetForm();
        setIsFormReady(true);
      }
    }
  }, [isOpen, promocodeData, promocodeId, form, centersData]);

  const onSubmit = (data: FormData) => {
    // Prevent submission if in step 1 (e.g. via Enter key) and just move to step 2
    if (step === 1) {
      setStep(2);
      return;
    }

    // Block submission if title already exists
    if (!promocodeId && titleValidation.isValid === false) {
      toast.error(
        titleValidation.message || "Please choose a different coupon name",
      );
      return;
    }

    // Calculate branches to send: send all selected branches
    const branchesToSend = selectedBranches; // Send all selected branches

    const payload = {
      title: data.title,
      description: data.description,
      percentage: data.percentage,
      start_date: format(data.start_date, "yyyy-MM-dd"),
      end_date: format(data.end_date, "yyyy-MM-dd"),
      max_number_of_usage: data.max_number_of_usage,
      kind_of_child: allowChildrenOnly ? "new_child" : "all",
      status: status, // Use current status state
      color: selectedColor,
      amount: data.amount,
      center_ids: [],
      branch_ids: branchesToSend,
    };

    if (promocodeId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCenterToggle = (centerId: number) => {
    const center = centers.find((c) => c.id === centerId);
    if (!center) return;

    const centerBranchIds = center.branches.map((b) => b.id);

    if (selectedCenters.includes(centerId)) {
      // Deselect Center -> Deselect all its branches
      setSelectedCenters((prev) => prev.filter((id) => id !== centerId));
      setSelectedBranches((prev) =>
        prev.filter((id) => !centerBranchIds.includes(id)),
      );
    } else {
      // Select Center -> Select all its branches
      setSelectedCenters((prev) => [...prev, centerId]);
      setSelectedBranches((prev) => [
        ...new Set([...prev, ...centerBranchIds]),
      ]);
    }
    setActiveCenterId(centerId);
  };

  const handleBranchToggle = (branchId: number) => {
    // Find the center this branch belongs to
    // Since we are likely in the context of activeCenterId, we can check that first,
    // but to be safe and support global search logic if added later, we search in all centers.
    const center = centers.find((c) =>
      c.branches.some((b) => b.id === branchId),
    );
    if (!center) return;

    let newSelectedBranches: number[] = [];

    if (selectedBranches.includes(branchId)) {
      // Deselect Branch
      newSelectedBranches = selectedBranches.filter((id) => id !== branchId);
      // If we deselect a branch, the parent center is no longer fully selected
      setSelectedCenters((prev) => prev.filter((id) => id !== center.id));
    } else {
      // Select Branch
      newSelectedBranches = [...selectedBranches, branchId];
      // Check if ALL branches of this center are now selected
      const centerBranchIds = center.branches.map((b) => b.id);
      const allSelected = centerBranchIds.every((id) =>
        newSelectedBranches.includes(id),
      );
      if (allSelected) {
        setSelectedCenters((prev) =>
          prev.includes(center.id) ? prev : [...prev, center.id],
        );
      }
    }
    setSelectedBranches(newSelectedBranches);
  };

  const handleSelectAllCenters = (checked: boolean) => {
    setSelectAllCenters(checked);
    if (checked) {
      setSelectedCenters(centers.map((c) => c.id));
      // Select all branches of all centers
      const allBranchIds = centers.flatMap((c) => c.branches.map((b) => b.id));
      setSelectedBranches(allBranchIds);
    } else {
      setSelectedCenters([]);
      setSelectedBranches([]);
    }
  };

  const handleSelectAllBranches = (checked: boolean) => {
    setSelectAllBranches(checked);
    // This usually applies to the filtered/visible branches (of the active center)
    const visibleBranchIds = filteredBranches.map((b) => b.id);

    // Find the active center
    const activeCenter = centers.find((c) => c.id === effectiveActiveCenterId);

    if (checked) {
      // Add visible branches to selection
      const newBranches = [
        ...new Set([...selectedBranches, ...visibleBranchIds]),
      ];
      setSelectedBranches(newBranches);

      // If active center exists and all its branches are now selected, select the center
      if (activeCenter) {
        const centerBranchIds = activeCenter.branches.map((b) => b.id);
        if (centerBranchIds.every((id) => newBranches.includes(id))) {
          setSelectedCenters((prev) => [
            ...new Set([...prev, activeCenter.id]),
          ]);
        }
      }
    } else {
      // Remove visible branches from selection
      const visibleIdsSet = new Set(visibleBranchIds);
      setSelectedBranches((prev) =>
        prev.filter((id) => !visibleIdsSet.has(id)),
      );
      // Deselect the active center since we are unchecking branches
      if (activeCenter) {
        setSelectedCenters((prev) =>
          prev.filter((id) => id !== activeCenter.id),
        );
      }
    }
  };

  useEffect(() => {
    if (filteredBranches.length > 0) {
      setSelectAllBranches(
        filteredBranches.every((b) => selectedBranches.includes(b.id)),
      );
    } else {
      setSelectAllBranches(false);
    }
  }, [selectedBranches, filteredBranches]);

  const incrementValue = (
    field: "percentage" | "amount" | "max_number_of_usage",
  ) => {
    const currentValue = form.getValues(field);
    form.setValue(field, currentValue + 1);
  };

  const decrementValue = (
    field: "percentage" | "amount" | "max_number_of_usage",
  ) => {
    const currentValue = form.getValues(field);
    form.setValue(field, Math.max(0, currentValue - 1));
  };

  const handleStep1Continue = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    const isValid = await form.trigger([
      "title",
      "description",
      "start_date",
      "end_date",
      "percentage",
      "amount",
      "max_number_of_usage",
    ]);

    // Wait for validation or block if title exists
    if (titleValidation.isChecking || titleValidation.isValid === false) {
      return;
    }

    if (isValid) {
      setStep(2);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="lg:max-w-4xl sm:max-w-2xl max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">
            {promocodeId
              ? isViewMode
                ? t("viewTitle") || "View Coupon Details"
                : t("editTitle") || "Edit Coupon Details"
              : step === 1
                ? t("step1Title")
                : t("step2Title")}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        {promocodeId && !isFormReady ? (
          <div className="p-6 space-y-6">
            {/* Status Skeleton */}
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Dates Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Percentage & Amount Skeleton */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Max Usage Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Color Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col min-h-0 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6">
                {step === 1 ? (
                  // Step 1: Coupon Details
                  <div className="space-y-6">
                    {/* Status Toggle - Only in Edit Mode */}
                    {promocodeId && (
                      <div className="flex items-center justify-between mb-6">
                        <Label className="text-base font-medium">
                          {t("couponStatus") || "Coupon Status"}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Switch
                          checked={status === "active"}
                          onCheckedChange={(checked) =>
                            statusMutation.mutate(
                              checked ? "active" : "inactive",
                            )
                          }
                          disabled={statusMutation.isPending || isViewMode}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                    )}

                    {/* Coupon Name */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            {t("couponName")}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                placeholder={t("couponNamePlaceholder")}
                                disabled={isViewMode}
                                className={`${
                                  fieldState.error ||
                                  titleValidation.isValid === false
                                    ? "border-red-500"
                                    : titleValidation.isValid === true
                                      ? "border-green-500"
                                      : ""
                                } pr-10`}
                              />

                              {/* Single validation icon based on state */}
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {titleValidation.isChecking ? (
                                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                ) : titleValidation.isValid === true ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : fieldState.error ||
                                  titleValidation.isValid === false ? (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                ) : null}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                          {/* Validation Message */}
                          {titleValidation.message && !fieldState.error && (
                            <p
                              className={`text-sm mt-1 ${
                                titleValidation.isValid === false
                                  ? "text-red-500"
                                  : "text-green-600"
                              }`}
                            >
                              {titleValidation.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Coupon Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("couponDescription")}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("couponDescriptionPlaceholder")}
                              disabled={isViewMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("startDate")}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              disabled={(date: any) =>
                                isViewMode || date < new Date("1900-01-01")
                              }
                              inputDisabled={isViewMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date */}
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("endDate")}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              disabled={(date: any) =>
                                isViewMode || date < new Date("1900-01-01")
                              }
                              inputDisabled={isViewMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Percentage and Amount */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("percentage")}{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2 border rounded-lg p-3">
                                <button
                                  type="button"
                                  onClick={() => decrementValue("percentage")}
                                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                  disabled={isViewMode}
                                >
                                  <Minus className="w-5 h-5 text-gray-600" />
                                </button>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  className="flex-1 text-center border-0 focus-visible:ring-0 p-0"
                                  disabled={isViewMode}
                                />
                                <button
                                  type="button"
                                  onClick={() => incrementValue("percentage")}
                                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                  disabled={isViewMode}
                                >
                                  <Plus className="w-5 h-5 text-primary" />
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("amount")}{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2 border rounded-lg p-3">
                                <button
                                  type="button"
                                  onClick={() => decrementValue("amount")}
                                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                  disabled={isViewMode}
                                >
                                  <Minus className="w-5 h-5 text-gray-600" />
                                </button>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  className="flex-1 text-center border-0 focus-visible:ring-0 p-0"
                                  disabled={isViewMode}
                                />
                                <button
                                  type="button"
                                  onClick={() => incrementValue("amount")}
                                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                  disabled={isViewMode}
                                >
                                  <Plus className="w-5 h-5 text-primary" />
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Max Usage */}
                    <FormField
                      control={form.control}
                      name="max_number_of_usage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maxUsage")}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2 border rounded-lg p-3">
                              <button
                                type="button"
                                onClick={() =>
                                  decrementValue("max_number_of_usage")
                                }
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                disabled={isViewMode}
                              >
                                <Minus className="w-5 h-5 text-gray-600" />
                              </button>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                                className="flex-1 text-center border-0 focus-visible:ring-0 p-0"
                                disabled={isViewMode}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  incrementValue("max_number_of_usage")
                                }
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                disabled={isViewMode}
                              >
                                <Plus className="w-5 h-5 text-primary" />
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Color Selection */}
                    <div className="space-y-3">
                      <Label>
                        {t("couponDesign")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-4">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              !isViewMode && setSelectedColor(color)
                            }
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                              !isViewMode ? "hover:scale-105" : "cursor-default"
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && (
                              <Check
                                className="w-6 h-6 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Children Only Checkbox */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="childrenOnly"
                        checked={allowChildrenOnly}
                        onCheckedChange={(checked) =>
                          setAllowChildrenOnly(checked as boolean)
                        }
                        disabled={isViewMode}
                      />
                      <Label htmlFor="childrenOnly" className="cursor-pointer">
                        {t("childrenOnly")}
                      </Label>
                    </div>
                  </div>
                ) : (
                  // Step 2: Select Centers and Branches
                  <div className="space-y-6">
                    <div className="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 gap-6">
                      {/* Centers List */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-right">
                          {t("centersAndNurseries")}
                        </h3>
                        <div className="space-y-3 border rounded-lg p-4 max-h-96 overflow-y-auto">
                          <div className="flex items-center gap-2 pb-3 border-b">
                            <Checkbox
                              id="all-centers"
                              checked={selectAllCenters}
                              onCheckedChange={handleSelectAllCenters}
                              disabled={isViewMode}
                            />
                            <Label
                              htmlFor="all-centers"
                              className="cursor-pointer"
                            >
                              {t("allCentersAndBranches")}
                            </Label>
                          </div>

                          {/* Center Search */}
                          <div className="relative mb-2">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder={
                                t("searchCenters") || "Search centers..."
                              }
                              value={centerSearchQuery}
                              onChange={(e) =>
                                setCenterSearchQuery(e.target.value)
                              }
                              className="pl-8 h-9 text-sm"
                              disabled={isViewMode}
                            />
                          </div>

                          {centersLoading ? (
                            <div className="space-y-2">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <ListItemSkeleton
                                  key={i}
                                  className="rounded-lg p-2"
                                  lines={1}
                                />
                              ))}
                            </div>
                          ) : filteredCenters.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              {t("noCenters") || "No centers available"}
                            </div>
                          ) : (
                            (() => {
                              // Grouping Logic
                              let relevantCenters: Center[] = [];
                              let otherCenters: Center[] = [];

                              if (promocodeId) {
                                // View/Edit Mode: Separate relevant centers
                                filteredCenters.forEach((center) => {
                                  const isSelected = selectedCenters.includes(
                                    center.id,
                                  );
                                  const hasSelectedBranches =
                                    center.branches.some((b) =>
                                      selectedBranches.includes(b.id),
                                    );

                                  if (isSelected || hasSelectedBranches) {
                                    relevantCenters.push(center);
                                  } else {
                                    otherCenters.push(center);
                                  }
                                });
                              } else {
                                // Create Mode: No separation
                                otherCenters = filteredCenters;
                              }

                              const renderCenterRow = (center: Center) => {
                                const isSelected = selectedCenters.includes(
                                  center.id,
                                );
                                const isActive =
                                  center.id === effectiveActiveCenterId;
                                const rowClass = isActive
                                  ? "bg-blue-50 border-blue-200"
                                  : "hover:bg-gray-50 border-transparent";

                                return (
                                  <div
                                    key={center.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${rowClass}`}
                                    onClick={() => setActiveCenterId(center.id)}
                                  >
                                    <Checkbox
                                      id={`center-${center.id}`}
                                      checked={isSelected}
                                      onCheckedChange={() =>
                                        handleCenterToggle(center.id)
                                      }
                                      disabled={isViewMode}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <Label
                                      htmlFor={`center-${center.id}`}
                                      className="cursor-pointer flex items-center gap-2 w-full pointer-events-none"
                                    >
                                      {center.logo ? (
                                        <img
                                          src={center.logo}
                                          alt={center.nursery_name}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-linear-to-br from-red-400 to-green-400 rounded-full" />
                                      )}
                                      {center.nursery_name}
                                    </Label>
                                  </div>
                                );
                              };

                              return (
                                <>
                                  {relevantCenters.map(renderCenterRow)}
                                  {relevantCenters.length > 0 &&
                                    otherCenters.length > 0 && (
                                      <div className="my-2 border-t border-dashed border-gray-300" />
                                    )}
                                  {otherCenters.map(renderCenterRow)}
                                </>
                              );
                            })()
                          )}
                        </div>
                      </div>

                      {/* Branches List */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-right">
                          {t("mainCenterBranches")}
                        </h3>
                        <div className="space-y-3 border rounded-lg p-4 max-h-96 overflow-y-auto">
                          <div className="flex items-center gap-2 pb-3 border-b">
                            <Checkbox
                              id="all-branches"
                              checked={selectAllBranches}
                              onCheckedChange={handleSelectAllBranches}
                              disabled={isViewMode}
                            />
                            <Label
                              htmlFor="all-branches"
                              className="cursor-pointer"
                            >
                              {t("allBranches")}
                            </Label>
                          </div>

                          {/* Branch Search */}
                          <div className="relative mb-2">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder={
                                t("searchBranches") || "Search branches..."
                              }
                              value={branchSearchQuery}
                              onChange={(e) =>
                                setBranchSearchQuery(e.target.value)
                              }
                              className="pl-8 h-9 text-sm"
                              disabled={isViewMode}
                            />
                          </div>

                          {centersLoading ? (
                            <div className="space-y-2">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <ListItemSkeleton
                                  key={i}
                                  className="rounded-lg p-2"
                                  lines={1}
                                  showLeading={false}
                                />
                              ))}
                            </div>
                          ) : filteredBranches.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              {selectedCenters.length === 0 &&
                              selectedBranches.length === 0
                                ? t("selectCenterFirst") ||
                                  "Select a center to view branches"
                                : t("noBranches") || "No branches available"}
                            </div>
                          ) : (
                            filteredBranches.map((branch) => (
                              <div
                                key={branch.id}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  id={`branch-${branch.id}`}
                                  checked={selectedBranches.includes(branch.id)}
                                  onCheckedChange={() =>
                                    handleBranchToggle(branch.id)
                                  }
                                  disabled={isViewMode}
                                />
                                <Label
                                  htmlFor={`branch-${branch.id}`}
                                  className="cursor-pointer"
                                >
                                  {branch.nursery_name}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t bg-white flex gap-4">
                {step === 1 ? (
                  <>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {isViewMode ? t("close") || "Close" : t("cancel")}
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      onClick={(e) => handleStep1Continue(e)}
                      className="flex-1 bg-primary"
                      disabled={
                        createMutation.isPending ||
                        updateMutation.isPending ||
                        titleValidation.isChecking ||
                        titleValidation.isValid === false
                      }
                    >
                      {titleValidation.isChecking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("checking") || "Checking..."}
                        </>
                      ) : (
                        t("continue")
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {t("back")}
                    </Button>
                    {isViewMode ? (
                      <Button
                        key="edit-btn"
                        size="sm"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onSwitchToEdit?.();
                        }}
                        className="flex-1 bg-primary"
                      >
                        {t("edit") || "Edit"}
                      </Button>
                    ) : (
                      <Button
                        key="submit-btn"
                        size="sm"
                        type="submit"
                        className="flex-1 bg-primary"
                        disabled={
                          createMutation.isPending ||
                          updateMutation.isPending ||
                          (selectedCenters.length === 0 &&
                            selectedBranches.length === 0)
                        }
                      >
                        {createMutation.isPending ||
                        updateMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {promocodeId
                              ? t("updating") || "Updating..."
                              : t("creating")}
                          </>
                        ) : promocodeId ? (
                          t("updateCoupon") || "Update Coupon"
                        ) : (
                          t("createCoupon")
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
