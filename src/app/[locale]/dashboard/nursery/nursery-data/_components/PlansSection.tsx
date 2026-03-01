"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useBranches } from "@/hooks/useBranches";
import { centerService } from "@/services/dashboardApi";
import { BranchPricingData, PricingFormData, Branch } from "@/types";
import { useTranslations } from "next-intl";
import { toastSuccess, toastError } from "@/lib/toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

// Zod schema for plan validation
// Helper to normalize age for compatibility
const normalizeAge = (
  age: number | { type: string; age: number } | null | undefined,
) => {
  if (age === null || age === undefined) {
    return { type: "year", age: 0 };
  }
  if (typeof age === "number") {
    return { type: "year", age };
  }
  return age;
};

// Zod schema for plan validation
const createPlanSchema = (t: any, isEditing: boolean) =>
  z
    .object({
      title: z.string().min(1, t("titleRequired")).min(2, t("titleTooShort")),
      start_age: z.object({
        type: z.string(),
        age: z.number().min(0, t("startAgeInvalid")),
      }),
      end_age: z.object({
        type: z.string(),
        age: z.number().min(0, t("endAgeInvalid")),
      }),
      enrollment_type: z.string().min(1, t("enrollmentTypeRequired")),
      count: z.number().min(1, t("countMustBePositive")),
      price_amount: z
        .number({
          invalid_type_error: t("priceMustBeNumber"),
          required_error: t("priceRequired"),
        })
        .min(1, t("priceMustBePositive")),
      branches: isEditing
        ? z.array(z.string()).optional()
        : z.array(z.string()).min(1, t("selectBranchesError")),
    })
    .refine(
      (data) => {
        const startMonths =
          data.start_age.type === "year"
            ? data.start_age.age * 12
            : data.start_age.age;
        const endMonths =
          data.end_age.type === "year"
            ? data.end_age.age * 12
            : data.end_age.age;
        return endMonths > startMonths;
      },
      {
        message: t("endAgeMustBeGreater"),
        path: ["end_age"],
      },
    );

type FormDataState = Omit<PricingFormData, "start_age" | "end_age"> & {
  start_age: { type: string; age: number };
  end_age: { type: string; age: number };
};

export const PlansSection = () => {
  const t = useTranslations("dashboard.profileEditor.plans");
  const queryClient = useQueryClient();
  const { data: branches, isLoading: branchesLoading } = useBranches();

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingFormData | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    enrollment_type: "",
    title: "",
    start_age: { type: "month", age: 0 },
    end_age: { type: "year", age: 0 },
    count: 0,
    price_amount: 0,
  });

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    start_age?: string;
    end_age?: string;
    enrollment_type?: string;
    count?: string;
    price_amount?: string;
    branches?: string;
  }>({});

  // React Query for branch pricing data
  const { data: branchPricing = [], isLoading: isPricingLoading } = useQuery<
    PricingFormData[]
  >({
    queryKey: ["branchPricing", selectedBranchId],
    queryFn: async () => {
      if (!selectedBranchId) return [];
      const response = await centerService.getBranchPricing(
        selectedBranchId.toString(),
      );
      return response.data || [];
    },
    enabled: !!selectedBranchId,
    staleTime: 2 * 60 * 1000,
  });

  // Save pricing mutation
  const savePricingMutation = useMutation({
    mutationFn: async (payload: BranchPricingData[]) => {
      return await centerService.savePricing(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["branchPricing"],
      });
      setIsDialogOpen(false);
      toastSuccess(t("planSaved"));
    },
    onError: () => toastError(t("planSaveError")),
  });

  // Delete pricing mutation
  const deletePricingMutation = useMutation({
    mutationFn: async (id: string) => {
      return await centerService.deletePricing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["branchPricing", selectedBranchId],
      });
      toastSuccess(t("planDeleted"));
    },
    onError: () => toastError(t("planDeleteError")),
  });

  // Select first branch automatically
  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const resetForm = () => {
    setFormData({
      enrollment_type: "",
      title: "",
      start_age: { type: "month", age: 0 },
      end_age: { type: "year", age: 0 },
      count: 0,
      price_amount: 0,
    });
    setFormErrors({});
  };

  const clearFieldError = (fieldName: keyof typeof formErrors) => {
    if (formErrors[fieldName]) {
      setFormErrors({ ...formErrors, [fieldName]: undefined });
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: PricingFormData) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      start_age: normalizeAge(plan.start_age),
      end_age: normalizeAge(plan.end_age),
      price_amount: Number(plan.price_amount),
    });
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const schema = createPlanSchema(t, !!editingPlan);

    // Prepare data for validation
    const validationData = {
      ...formData,
      title: formData.title.trim(),
      branches: editingPlan ? undefined : selectedBranchIds,
    };

    const result = schema.safeParse(validationData);

    if (!result.success) {
      const errors: typeof formErrors = {};

      result.error.errors.forEach((error) => {
        const path = error.path[0] as string;
        errors[path as keyof typeof formErrors] = error.message;
      });

      setFormErrors(errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleSavePlan = () => {
    if (!validateForm()) {
      return;
    }

    const branchesToUpdate = (
      editingPlan ? [selectedBranchId] : selectedBranchIds
    ).map((branchId) => {
      const updatedPricing = editingPlan
        ? branchPricing.map((p: PricingFormData) =>
            p.id === editingPlan.id
              ? {
                  ...formData,
                  price_amount: Number(formData.price_amount),
                }
              : {
                  ...p,
                  start_age: normalizeAge(p.start_age),
                  end_age: normalizeAge(p.end_age),
                  price_amount: Number(p.price_amount),
                },
          )
        : [formData];

      return {
        branch_id: Number(branchId),
        prices: updatedPricing,
      };
    });

    savePricingMutation.mutate(branchesToUpdate);
  };

  const handleDeletePlan = (planId: number) => {
    if (!selectedBranchId) return;
    deletePricingMutation.mutate(planId.toString());
  };

  if (branchesLoading) {
    return <div className="text-center py-4">{t("loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-none border-0">
        <CardContent className="space-y-6 p-0">
          {/* Branch Selector */}
          <div className="space-y-3">
            <Label>{t("selectBranch")}</Label>
            <Select
              value={selectedBranchId?.toString()}
              onValueChange={(value) => setSelectedBranchId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectBranchPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {branches?.map((branch: Branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plans List */}
          {selectedBranchId && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">{t("plans")}</h3>
                <Button
                  onClick={handleAddPlan}
                  size="icon"
                  className="rounded-full w-9 h-9 sm:self-start"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {isPricingLoading ? (
                <div className="space-y-3 py-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : branchPricing.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t("noPlansYet")}
                </p>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {branchPricing.map((plan) => (
                    <Card key={plan.id} className="p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{plan.title}</h4>
                          {/* <p className="text-sm text-muted-foreground">
                              {t("ageRange", {
                                start: `${plan.start_age.age} ${t(plan.start_age.type)}`,
                                end: `${plan.end_age.age} ${t(plan.end_age.type)}`,
                              })}
                            </p>
                            <p className="text-sm">
                              {t("priceAmount", { amount: plan.price_amount })}
                            </p> */}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditPlan(plan)}
                            variant="outline"
                            size="icon"
                            className="rounded-full w-9 h-9"
                          >
                            <Edit className="w-5 h-5" />
                          </Button>
                          <Button
                            onClick={() => handleDeletePlan(plan.id!)}
                            variant="destructive"
                            size="icon"
                            className="rounded-full w-9 h-9"
                            disabled={deletePricingMutation.isPending}
                          >
                            {deletePricingMutation.isPending ? (
                              <div className="h-4 w-4 bg-white/20 rounded animate-pulse" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit Plan */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? t("editPlan") : t("addPlan")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Branches (only when adding new) */}
            {!editingPlan && (
              <div className="space-y-3">
                <Label>{t("branches")}</Label>
                <MultiSelect
                  options={
                    branches?.map((branch: Branch) => ({
                      label: branch.name,
                      value: branch.id.toString(),
                    })) || []
                  }
                  selected={selectedBranchIds}
                  onChange={(value) => {
                    setSelectedBranchIds(value);
                    clearFieldError("branches");
                  }}
                  placeholder={t("selectBranchesPlaceholder")}
                />
                {formErrors.branches && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.branches}
                  </p>
                )}
              </div>
            )}

            {/* Title */}
            <div className="space-y-3">
              <Label>{t("planTitle")}</Label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  clearFieldError("title");
                }}
                placeholder={t("planTitlePlaceholder")}
                className={formErrors.title ? "border-destructive" : ""}
              />
              {formErrors.title && (
                <p className="text-sm text-destructive mt-1">
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("startAge")}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={formData.start_age.age}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        start_age: {
                          ...formData.start_age,
                          age: Number(e.target.value),
                        },
                      });
                      clearFieldError("start_age");
                    }}
                    className={formErrors.start_age ? "border-destructive" : ""}
                  />
                  <Select
                    value={formData.start_age.type}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        start_age: { ...formData.start_age, type: value },
                      });
                    }}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">{t("month")}</SelectItem>
                      <SelectItem value="year">{t("year")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formErrors.start_age && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.start_age}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("endAge")}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={formData.end_age.age}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        end_age: {
                          ...formData.end_age,
                          age: Number(e.target.value),
                        },
                      });
                      clearFieldError("end_age");
                    }}
                    className={formErrors.end_age ? "border-destructive" : ""}
                  />
                  <Select
                    value={formData.end_age.type}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        end_age: { ...formData.end_age, type: value },
                      });
                    }}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">{t("month")}</SelectItem>
                      <SelectItem value="year">{t("year")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formErrors.end_age && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.end_age}
                  </p>
                )}
              </div>
            </div>

            {/* Enrollment Type */}
            <div className="space-y-3">
              <Label>{t("enrollmentType")}</Label>
              <Select
                value={formData.enrollment_type}
                onValueChange={(value) => {
                  setFormData({ ...formData, enrollment_type: value });
                  clearFieldError("enrollment_type");
                }}
              >
                <SelectTrigger
                  className={
                    formErrors.enrollment_type ? "border-destructive" : ""
                  }
                >
                  <SelectValue placeholder={t("selectEnrollmentType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">{t("year")}</SelectItem>
                  <SelectItem value="month">{t("month")}</SelectItem>
                  <SelectItem value="week">{t("week")}</SelectItem>
                  <SelectItem value="day">{t("day")}</SelectItem>
                  <SelectItem value="hour">{t("hour")}</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.enrollment_type && (
                <p className="text-sm text-destructive mt-1">
                  {formErrors.enrollment_type}
                </p>
              )}
            </div>

            {/* Count & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>{t("count")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.count}
                  onChange={(e) => {
                    setFormData({ ...formData, count: Number(e.target.value) });
                    clearFieldError("count");
                  }}
                  className={formErrors.count ? "border-destructive" : ""}
                />
                {formErrors.count && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.count}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label>{t("price")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.price_amount}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      price_amount: Number(e.target.value),
                    });
                    clearFieldError("price_amount");
                  }}
                  className={
                    formErrors.price_amount ? "border-destructive" : ""
                  }
                />
                {formErrors.price_amount && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.price_amount}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={savePricingMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSavePlan}
                disabled={savePricingMutation.isPending}
                className="gap-2"
              >
                {savePricingMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 bg-white/20 rounded animate-pulse" />
                    {t("saving")}
                  </>
                ) : (
                  t("save")
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
