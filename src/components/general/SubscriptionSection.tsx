"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { animate } from "framer-motion";
import { Loader2 } from "lucide-react";
import { paymentService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { usePlans } from "@/hooks/usePlans";
import { Skeleton } from "../ui/skeleton";
import { SubscriptionWarningModal } from "../modals/SubscriptionWarningModal";
import { toastError, toastWarning } from "@/lib/toast";

const SubscriptionSection = () => {
  const t = useTranslations("HomePage.Subscription");
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Get current user from auth store
  const currentUser = useAuthStore.getState().user;

  // Use the new usePlans hook instead of static plans
  const { plans, loading, error } = usePlans();

  // Move all hooks to the top level to avoid Rules of Hooks violation
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // Create the motion template at the top level
  const backgroundStyle = useMotionTemplate`
    radial-gradient(
      650px circle at ${mouseX}px ${mouseY}px,
      rgba(64, 79, 177, 1),
      transparent 80%
    )
  `;

  // Center the circle behind the button by default
  useEffect(() => {
    function setCenter(smooth = false) {
      if (cardRef.current && buttonRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        const btnRect = buttonRef.current.getBoundingClientRect();
        // Center of the button relative to the card
        const centerX = btnRect.left - cardRect.left + btnRect.width / 2;
        const centerY = btnRect.top - cardRect.top + btnRect.height / 2;
        if (smooth) {
          animate(mouseX, centerX, {
            type: "spring",
            duration: 0.5,
          });
          animate(mouseY, centerY, {
            type: "spring",
            duration: 0.5,
          });
        } else {
          mouseX.set(centerX);
          mouseY.set(centerY);
        }
      } else if (cardRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        if (smooth) {
          animate(mouseX, cardRect.width / 2, {
            type: "spring",
            duration: 0.5,
          });
          animate(mouseY, cardRect.height / 2, {
            type: "spring",
            duration: 0.5,
          });
        } else {
          mouseX.set(cardRect.width / 2);
          mouseY.set(cardRect.height / 2);
        }
      }
    }
    setCenter();
    window.addEventListener("resize", () => setCenter(false));
    return () => window.removeEventListener("resize", () => setCenter(false));
  }, [mouseX, mouseY]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    animate(mouseX, e.clientX - rect.left, {
      type: "spring",
      duration: 0.3,
    });
    animate(mouseY, e.clientY - rect.top, {
      type: "spring",
      duration: 0.3,
    });
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    // Re-center when mouse leaves, smoothly
    if (cardRef.current && buttonRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const btnRect = buttonRef.current.getBoundingClientRect();
      const centerX = btnRect.left - cardRect.left + btnRect.width / 2;
      const centerY = btnRect.top - cardRect.top + btnRect.height / 2;
      animate(mouseX, centerX, { type: "spring", duration: 0.5 });
      animate(mouseY, centerY, { type: "spring", duration: 0.5 });
    }
  }

  const handlePayment = async (planId: number) => {
    // Check if user is authenticated first
    const isAuthenticated = useAuthStore.getState().isAuthenticated();
    if (!isAuthenticated) {
      toastWarning(
        "Authentication Required",
        "Please log in to subscribe to a plan.",
      );
      return;
    }

    // Check if user is a parent - parents cannot subscribe to center plans
    if (currentUser?.role === "parent") {
      toastError(
        "Access Denied",
        "Parent accounts cannot subscribe to center plans. Please use a center account to subscribe.",
      );
      return;
    }

    // Check if current plan is still active
    const isPlanActive = () => {
      if (currentUser?.subscription_status === "free") {
        const freeTrialEndDate = new Date(
          currentUser?.free_trail_end_date || 0,
        );
        return freeTrialEndDate > new Date();
      } else {
        const subscriptionEndDate = new Date(
          currentUser?.subscription_end_date || 0,
        );
        return subscriptionEndDate > new Date();
      }
    };

    if (isPlanActive()) {
      // Show warning modal
      setSelectedPlanId(planId);
      setShowWarningModal(true);
      return;
    }

    // Proceed with payment if no active plan
    await proceedWithPayment(planId);
  };

  const proceedWithPayment = async (planId: number) => {
    setIsSubmitting(planId);
    try {
      console.log("Initiating payment for plan:", planId);
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

      const data = await paymentService.centerSubscribe(planId);
      setIsSubmitting(null);

      console.log("Payment response:", data);

      if (data.success && data.payment_url) {
        // Redirect to Moyasar payment page
        console.log("Redirecting to payment URL:", data.payment_url);
        window.location.href = data.payment_url;
      } else {
        console.error("Payment initiation failed - Invalid response:", data);
        toastError(
          "Payment Failed",
          data.message || "Invalid response from server",
        );
      }
    } catch (err: any) {
      setIsSubmitting(null);
      console.error("Payment error details:", {
        error: err,
        message: err.message,
        status: err.status,
        data: err.data,
        url: err.url,
        method: err.method,
      });

      // Provide more specific error messages based on the error type
      let errorTitle = "Payment Failed";
      let errorMessage =
        "Payment initiation failed. Please check your connection and try again.";

      if (err.status === 401) {
        errorTitle = "Authentication Required";
        errorMessage = "Please log in again to continue.";
      } else if (err.status === 403) {
        errorTitle = "Access Denied";
        errorMessage = "You don't have permission to perform this action.";
      } else if (err.status === 422) {
        errorTitle = "Invalid Request";
        errorMessage = "Please check your input and try again.";
      } else if (err.status === 500) {
        errorTitle = "Server Error";
        errorMessage = "Please try again later.";
      } else if (err.status === 0 || !err.status) {
        errorTitle = "Network Error";
        errorMessage = "Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      toastError(errorTitle, errorMessage);
    }
  };

  // Show success message if redirected from payment
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("payment") === "success") {
        setSubmitSuccess(true);
      }
    }
  }, []);

  if (submitSuccess) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 60 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto"
          >
            <div className="mb-6">
              <Image
                src="/assets/illustrations/success.png"
                alt="Success"
                width={100}
                height={100}
              />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">
              {t("success.title") || "Subscription Successful!"}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("success.message") ||
                "Thank you for your subscription. You will receive a confirmation email shortly."}
            </p>
            <Button
              onClick={() => setSubmitSuccess(false)}
              className="bg-primary hover:bg-[#3646a5] text-white"
            >
              {t("success.continue") || "Continue"}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  // Loading skeleton for plans
  const renderPlanSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`relative ${
            i === 2 ? "mt-28" : ""
          } bg-white rounded-2xl shadow-md overflow-hidden`}
          style={{ height: i === 2 ? "500px" : "450px" }}
        >
          <div className="p-6 h-full flex flex-col">
            <Skeleton className="h-12 w-32 mx-auto mb-4" />
            <Skeleton className="h-24 w-40 mx-auto mb-6" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-5 w-32 mx-auto mb-8" />
            <div className="mt-auto">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 heading-3 text-primary-blue text-center">
          {t("title")}
        </h2>

        {/* Promo Banner */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="z-20 relative flex flex-col items-center gap-y-8 text-center py-14.5 px-10 bg-[linear-gradient(to_right,#2B399000_0%,#2B3990FF_30%,#2B3990FF_70%,#2B399000_100%)]">
            <div className="flex flex-col items-center gap-y-3.5">
              <p className="font-medium text-white">{t("banner.title")}</p>
              <p className="heading-3 text-white">
                <span>{t("banner.subtitle")}</span>{" "}
                <span className="text-warning">{t("banner.month")}</span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-y-3.5">
              <Button
                size="sm"
                variant="defaultNoGradient"
                className="bg-white hover:bg-white/90 text-primary rounded-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const popularPlan = plans.find((plan) => plan.popular);
                  if (popularPlan) {
                    handlePayment(popularPlan.planId);
                  }
                }}
                disabled={loading || isSubmitting !== null}
              >
                {loading ? (
                  <Skeleton className="h-4 w-24 bg-white/70" />
                ) : isSubmitting !== null ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("plans.processing") || "Processing..."}
                  </div>
                ) : (
                  t("banner.cta")
                )}
              </Button>
              <p className="text-warning font-medium flex items-center">
                {t("banner.limitedOffer")}
              </p>
            </div>
          </div>

          <Image
            src="/assets/backgrounds/surprise.jpg"
            alt="background"
            className="z-10 absolute top-0 left-0 w-full h-full object-cover object-center"
            fill
          />
        </div>

        {/* Pricing Plans */}
        {loading ? (
          renderPlanSkeletons()
        ) : error ? (
          <div className="col-span-3 text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-8">
            {plans.map((plan) => {
              if (plan.popular) {
                return (
                  <div
                    key={plan.id}
                    ref={cardRef}
                    className={
                      "relative z-30 xl:px-10 py-10 lg:py-20 mt-28 bg-primary-blue text-white rounded-5xl group "
                    }
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Animated radial gradient background */}
                    <motion.div
                      className="pointer-events-none absolute -inset-px rounded-5xl z-30"
                      animate={{ opacity: isHovered ? 1 : 1 }}
                      transition={{ opacity: { duration: 0.4 } }}
                      style={{
                        background: backgroundStyle,
                      }}
                    />
                    <div className="z-20 absolute inset-0 bg-primary-blue rounded-5xl" />
                    <div className="z-10 w-full absolute bottom-[calc(100%-1.5rem)] right-0 bg-linear-to-b from-white to-secondary-mint-green/24 text-primary heading-4 text-center font-bold px-4 pt-6 pb-12 rounded-t-5xl">
                      {t("plans.popular")}
                    </div>
                    <div className="z-30 relative p-6 flex flex-col items-center gap-10">
                      <p className="text-5xl lg:text-[4rem] 2xl:text-[5rem] font-extrabold">
                        <span>{plan.price}</span> <span className="sar">$</span>
                      </p>
                      <h3>{plan.name}</h3>
                      <p className="font-medium">{t("plans.commission")}</p>
                      <Button
                        ref={buttonRef}
                        size="sm"
                        variant="defaultNoGradient"
                        className="w-full rounded-xl bg-white text-primary-blue hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handlePayment(plan.planId)}
                        disabled={isSubmitting === plan.planId}
                      >
                        {isSubmitting === plan.planId ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("plans.processing")}
                          </div>
                        ) : (
                          plan.buttonText
                        )}
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={plan.id}
                  className={
                    "relative xl:px-10 py-10 lg:py-20 bg-white text-primary-blue rounded-xl shadow-[0_2px_80px_0_rgba(34,34,34,0.08)]"
                  }
                >
                  <div className="z-30 relative p-6 flex flex-col items-center gap-10">
                    <p className="text-5xl lg:text-[4rem] 2xl:text-[5rem] font-extrabold">
                      <span>{plan.price}</span> <span className="sar">$</span>
                    </p>
                    <h3>{plan.name}</h3>
                    <p className="font-medium">{t("plans.commission")}</p>
                    <Button
                      size="sm"
                      className="w-full rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePayment(plan.planId)}
                      disabled={isSubmitting === plan.planId}
                    >
                      {isSubmitting === plan.planId ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("plans.processing")}
                        </div>
                      ) : (
                        plan.buttonText
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Warning Modal */}
        <SubscriptionWarningModal
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          onConfirm={() => {
            if (selectedPlanId) {
              proceedWithPayment(selectedPlanId);
              setShowWarningModal(false);
              setSelectedPlanId(null);
            }
          }}
          user={currentUser}
        />
      </div>
    </section>
  );
};

export default SubscriptionSection;
