"use client";

import { useState, useMemo, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ListSkeleton,
  SelectFieldSkeleton,
} from "@/components/loading/LoadingSkeletons";
import {
  ChevronLeft,
  Search,
  LoaderCircle,
  MapPin,
  Copy,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getBranchesForCenterAction,
  getBranchPricingAction,
  createExistingEnrollmentAction,
} from "@/actions/nurseryActions";
import { EstablishmentResponse } from "@/types";
import { establishmentService } from "@/services/api";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { toastError, toastSuccess } from "@/lib/toast";

interface EnrollmentModalProps {
  open: boolean;
  onAddChild?: () => void;
  hasChildren: boolean;
  children?: Array<{ id: number; name: string; image?: string }>;
}

type ModalStep =
  | "initial"
  | "search"
  | "enrollment"
  | "no-children"
  | "success";

export default function EnrollmentModal({
  open,
  onAddChild,
  hasChildren,
  children = [],
}: EnrollmentModalProps) {
  const locale = useLocale();
  const t = useTranslations("enrollmentModal");
  const [step, setStep] = useState<ModalStep>("initial");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] =
    useState<EstablishmentResponse | null>(null);
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = "https://firststep-app.com/sign-up/center";

  // Reset modal state when it opens (only on first open)
  useEffect(() => {
    if (open && step === "initial") {
      setSearchQuery("");
      setSelectedCenter(null);
      setSelectedChildren([]);
      setSelectedBranch("");
      setSelectedPlan("");
      setShowInviteLink(false);
    }
  }, [open]);

  // Fetch centers using React Query
  const { data: centers = [], isLoading: centersLoading } = useQuery({
    queryKey: ["centers", locale],
    queryFn: () => establishmentService.getEstablishments(locale),
    enabled: step === "search" && open,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch branches for selected center
  const { data: branchesData, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches", selectedCenter?.id],
    queryFn: () => getBranchesForCenterAction(selectedCenter!.id.toString()),
    enabled: !!selectedCenter && step === "enrollment",
    staleTime: 5 * 60 * 1000,
  });

  const branches = branchesData?.data || [];

  // Fetch pricing for selected branch
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["plans", selectedBranch, selectedCenter?.id],
    queryFn: () =>
      getBranchPricingAction(selectedBranch, selectedCenter!.id.toString()),
    enabled: !!selectedBranch && !!selectedCenter,
    staleTime: 5 * 60 * 1000,
  });

  // Enrollment submission mutation
  const enrollmentMutation = useMutation({
    mutationFn: async (data: {
      center: EstablishmentResponse;
      children: number[];
      branch: string;
      plan: string;
    }) => {
      return createExistingEnrollmentAction({
        center_branch_id: data.branch,
        branch_price_id: data.plan,
        children: data.children,
      });
    },
    onSuccess: () => {
      toastSuccess(t("success.title"), t("success.description") || undefined);
      setStep("success");
    },
    onError: (error: any) => {
      console.error("Failed to submit enrollment:", error);

      // Handle validation errors
      if (error?.errors) {
        const errorMessages = Object.values(error.errors).flat().join(", ");
        toastError(t("enrollment.error") || "Enrollment failed", errorMessages);
      } else if (error?.message) {
        toastError(t("enrollment.error") || "Enrollment failed", error.message);
      } else {
        const fallbackError =
          t("enrollment.errorGeneric") ||
          "An error occurred while submitting enrollment";
        toastError(t("enrollment.error") || "Enrollment failed", fallbackError);
      }
    },
  });

  const isLoading = centersLoading || branchesLoading || plansLoading;

  const filteredCenters = useMemo(
    () =>
      centers.filter(
        (center: EstablishmentResponse) =>
          center.nursery_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          center.address?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [centers, searchQuery],
  );

  const handleBack = () => {
    if (step === "search") {
      setStep("initial");
      setSearchQuery("");
    } else if (step === "enrollment") {
      setStep("search");
      setSelectedCenter(null);
      setSelectedChildren([]);
      setSelectedBranch("");
      setSelectedPlan("");
    } else if (step === "no-children") {
      setStep("search");
      setSelectedCenter(null);
    }
  };

  const handleCenterSelect = (center: EstablishmentResponse) => {
    setSelectedCenter(center);
    // Reset selections when selecting a new center
    setSelectedChildren([]);
    setSelectedBranch("");
    setSelectedPlan("");

    if (hasChildren && children.length > 0) {
      setStep("enrollment");
    } else {
      setStep("no-children");
    }
  };

  const handleSubmitEnrollment = () => {
    if (!selectedCenter) return;

    enrollmentMutation.mutate({
      center: selectedCenter,
      children: selectedChildren,
      branch: selectedBranch,
      plan: selectedPlan,
    });
  };

  const toggleChildSelection = (childId: number) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="max-w-4xl sm:max-w-4xl w-auto min-w-xl max-h-[90vh] overflow-y-auto p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
          {step !== "initial" && step !== "success" && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-semibold flex-1 text-center">
            {(step === "search" ||
              step === "enrollment" ||
              step === "no-children") &&
              t("title")}
          </h2>
          {/* Spacer to keep title centered */}
          {step !== "initial" && step !== "success" && (
            <div className="w-9 h-9" />
          )}
        </div>

        <div className="p-6">
          {/* Initial Step */}
          {step === "initial" && (
            <div className="text-center space-y-8">
              <h3 className="text-2xl font-bold text-secondary-mint-green">
                {t("initial.successTitle")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Link
                  href="/establishments"
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-secondary-mint-green transition-colors"
                >
                  <Image
                    src="/assets/illustrations/abstract-search.png"
                    width={190}
                    height={200}
                    alt=""
                  />
                  <h4 className="font-semibold text-gray mb-2">
                    {t("initial.noSubscription.title")}
                  </h4>
                  <p className="text-sm text-light-gray">
                    {t("initial.noSubscription.description")}
                  </p>
                </Link>
                <button
                  onClick={() => setStep("search")}
                  className="cursor-pointer p-6 border-2 border-secondary-mint-green rounded-2xl bg-secondary-mint-green/5 hover:bg-secondary-mint-green/10 transition-colors"
                >
                  <Image
                    src="/assets/illustrations/globe-location.png"
                    width={200}
                    height={200}
                    alt=""
                  />
                  <h4 className="whitespace-nowrap font-semibold text-gray mb-2">
                    {t("initial.hasSubscription.title")}
                  </h4>
                  <p className="text-sm text-light-gray">
                    {t("initial.hasSubscription.description")}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Search Centers Step */}
          {step === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12"
                />
              </div>

              {isLoading ? (
                <ListSkeleton count={5} />
              ) : (
                <div className="space-y-3">
                  {filteredCenters.map((center: EstablishmentResponse) => (
                    <button
                      key={center.id}
                      onClick={() => handleCenterSelect(center)}
                      className="w-full p-2 border-b rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-4 text-right cursor-pointer"
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                        {center.logo && (
                          <img
                            src={center.logo}
                            alt={center.nursery_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h4 className="text-base font-medium text-gray">
                        {center.nursery_name}
                      </h4>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} className="text-info" />
                        <span className="text-sm text-gray text-center">
                          {typeof center.city === "object"
                            ? center.city?.name[locale as "ar"]
                            : center.city}
                          {center.neighborhood
                            ? ", " + center.neighborhood
                            : null}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="text-center py-8 space-y-4">
                <p className="text-gray-600 mb-4">{t("search.notFound")}</p>
                {!showInviteLink ? (
                  <Button size="long" onClick={() => setShowInviteLink(true)}>
                    {t("search.inviteButton")}
                  </Button>
                ) : (
                  <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-mint-green text-white rounded-lg hover:bg-secondary-mint-green/90 transition-colors text-sm font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            {t("search.copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            {t("search.copy")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enrollment Step (with children) */}
          {step === "enrollment" && (
            <div className="space-y-6">
              <div className="w-full p-2 border-b rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-4 text-right cursor-pointer">
                <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                  {selectedCenter?.logo && (
                    <img
                      src={selectedCenter.logo}
                      alt={selectedCenter.nursery_name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h4 className="text-base font-medium text-gray">
                  {selectedCenter?.nursery_name}
                </h4>
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-info" />
                  <span className="text-sm text-gray text-center">
                    {typeof selectedCenter?.city === "object"
                      ? selectedCenter.city?.name[locale as "ar"]
                      : selectedCenter?.city}
                    {typeof selectedCenter?.neighborhood === "object" &&
                    selectedCenter?.neighborhood !== null
                      ? ", " + selectedCenter?.neighborhood[locale as "ar"]
                      : ", " + selectedCenter?.neighborhood}{" "}
                    {selectedCenter?.address
                      ? ", " + selectedCenter?.address
                      : null}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">
                  {t("enrollment.selectChildren")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => toggleChildSelection(child.id)}
                      className={`p-4 border-2 rounded-xl transition-colors ${
                        selectedChildren.includes(child.id)
                          ? "border-pink-400 bg-pink-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="w-20 h-20 mx-auto mb-2 bg-gray-100 rounded-full overflow-hidden">
                        {child.image && (
                          <img
                            src={child.image}
                            alt={child.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="text-sm font-medium">{child.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-3">
                  {t("enrollment.selectBranch")}
                </label>
                {branchesLoading ? (
                  <SelectFieldSkeleton className="space-y-0" />
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full p-3 border rounded-xl"
                  >
                    <option value="">
                      {t("enrollment.selectBranchPlaceholder")}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.nursery_name || branch.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-3">
                  {t("enrollment.selectProgram")}
                </label>
                {plansLoading ? (
                  <SelectFieldSkeleton className="space-y-0" />
                ) : (
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full p-3 border rounded-xl"
                    disabled={!selectedBranch}
                  >
                    <option value="">
                      {t("enrollment.selectProgramPlaceholder")}
                    </option>
                    {plans.map((plan, index) => (
                      <option key={plan.id || index} value={plan.id || index}>
                        {plan.name || plan.title || `خطة ${index + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <Button
                onClick={handleSubmitEnrollment}
                disabled={
                  selectedChildren.length === 0 ||
                  !selectedBranch ||
                  !selectedPlan ||
                  enrollmentMutation.isPending
                }
                className="w-full"
                size="lg"
              >
                {enrollmentMutation.isPending && (
                  <LoaderCircle className="w-5 h-5 animate-spin mr-2" />
                )}
                {t("enrollment.submitButton")}
              </Button>
            </div>
          )}

          {/* No Children Step */}
          {step === "no-children" && (
            <div className="text-center space-y-6">
              <div className="w-full p-2 rounded-xl transition-colors flex items-center gap-4 text-right bg-linear-to-br from-[#E9F1FF7A] to-[#9FC3FF7A]">
                <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                  {selectedCenter?.logo && (
                    <img
                      src={selectedCenter.logo}
                      alt={selectedCenter.nursery_name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h4 className="text-base font-medium text-gray">
                  {selectedCenter?.nursery_name}
                </h4>
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-info" />
                  <span className="text-sm text-gray text-center">
                    {typeof selectedCenter?.city === "object"
                      ? selectedCenter.city?.name[locale as "ar"]
                      : selectedCenter?.city}
                    {typeof selectedCenter?.neighborhood === "object" &&
                    selectedCenter?.neighborhood !== null
                      ? ", " + selectedCenter?.neighborhood[locale as "ar"]
                      : ", " + selectedCenter?.neighborhood}{" "}
                    {selectedCenter?.address
                      ? ", " + selectedCenter?.address
                      : null}
                  </span>
                </div>
              </div>

              <div className="py-8 flex flex-col items-center gap-6">
                <div className="w-fit mx-auto grid grid-cols-2 gap-4">
                  <div className="w-28 p-4 saturate-0 relative border rounded-2xl">
                    <Image
                      src="/assets/illustrations/boy.png"
                      alt="Boy"
                      width={61}
                      height={80}
                      className="mx-auto"
                    />
                  </div>

                  <div className="w-28 p-4 saturate-0 relative border rounded-2xl">
                    <Image
                      src="/assets/illustrations/girl.png"
                      alt="Girl"
                      width={57}
                      height={80}
                      className="mx-auto"
                    />
                  </div>
                </div>

                <p className="font-semibold text-gray">
                  {t("noChildren.title")}
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  asChild
                  size="long"
                  variant="outline"
                  className="flex-1"
                >
                  <Link href="/dashboard/parent">
                    {t("noChildren.dashboardButton")}
                  </Link>
                </Button>
                <Button
                  size="long"
                  className="flex-1"
                  onClick={() => {
                    if (onAddChild) {
                      onAddChild();
                    }
                  }}
                >
                  {t("noChildren.addChildButton")}
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-32 h-32 mx-auto bg-pink-200 rounded-full flex items-center justify-center">
                <Image
                  src="/assets/illustrations/check-mark.png"
                  width={140}
                  height={140}
                  alt="Success"
                />
              </div>
              <h3 className="text-2xl font-bold text-secondary-mint-green">
                {t("success.title")}
              </h3>
              <Button asChild size="lg" className="min-w-[200px]">
                <Link href="/dashboard/parent">
                  {t("success.dashboardButton")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
