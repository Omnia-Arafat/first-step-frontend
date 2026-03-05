"use client";

import React from "react";
import useOTPTimer from "@/hooks/useOTPTimer";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  createOTPVerificationSchema,
  OTPVerificationFormData,
} from "@/lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/api";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/error-handling";

const SendOTPForm = ({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess?: () => void;
}) => {
  const t = useTranslations("auth.otp.form");
  const tBtns = useTranslations("auth.buttons");
  const router = useRouter();
  const locale = useLocale();
  const formSchema = createOTPVerificationSchema(locale as "ar" | "en");
  const form = useForm<OTPVerificationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  // State for resend functionality
  const [resendCount, setResendCount] = React.useState(0);
  const MAX_RESEND_ATTEMPTS = 3;

  const mutation = useMutation<
    any, // Success response type (update this based on your API response)
    ApiError,
    OTPVerificationFormData
  >({
    mutationFn: async (data) => {
      if (!email) {
        throw {
          message:
            locale === "ar"
              ? "البريد الإلكتروني غير موجود."
              : "Email not found.",
          errors: {},
          status: 400,
        };
      }
      return await authService.checkOTP(email, data.otp);
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/reset-password?email=${email}`);
      }
    },
    onError: (error) => {
      // Clear any existing errors
      form.clearErrors();

      // Handle field-specific validation errors
      if (error.errors && Object.keys(error.errors).length > 0) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (field === "otp") {
            form.setError("otp", {
              type: "server",
              message: Array.isArray(messages) ? messages[0] : messages,
            });
          }
        });
      }

      // Always show the main error message
      form.setError("root", {
        type: "server",
        message: error.message,
      });
    },
  });

  const onSubmit = async (data: OTPVerificationFormData) => {
    // Clear any existing errors before submitting
    form.clearErrors();
    mutation.mutate(data);
  };

  // Resend OTP mutation
  const resendMutation = useMutation<any, ApiError, string>({
    mutationFn: async (email: string) => {
      return await authService.forgotPassword(email);
    },
    onSuccess: () => {
      setResendCount((prev) => prev + 1);
      resetTimer();
      form.clearErrors();
    },
    onError: (error) => {
      form.setError("root", {
        type: "server",
        message: error.message || "Failed to resend OTP",
      });
    },
  });

  const { timeLeft, otpExpired, resetTimer } = useOTPTimer({
    duration: 120, // 2 minutes for production
    onExpire: () => {
      // Timer expired, user can now resend
    },
  });

  const handleResendOTP = () => {
    if (resendCount >= MAX_RESEND_ATTEMPTS) {
      form.setError("root", {
        type: "limit",
        message: t("max-attempts-reached"),
      });
      return;
    }
    resendMutation.mutate(email);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6"
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-mid-gray text-center break-all">
            {t("description")}{" "}
            <span className="font-semibold text-primary">{email}</span>
          </p>
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-primary text-sm hover:underline font-medium"
          >
            {locale === "ar" ? "تغيير البريد الإلكتروني" : "Change Email"}
          </button>
        </div>

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem dir="ltr" className="flex flex-col items-center">
              <FormControl>
                <InputOTP
                  maxLength={4}
                  {...field}
                  disabled={mutation.isPending}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription className="font-medium text-mid-gray text-base mt-4">
                {otpExpired ? (
                  resendCount >= MAX_RESEND_ATTEMPTS ? (
                    <span className="font-normal text-red-600">
                      {t("max-attempts-reached")}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-red-500 text-sm italic">
                        {t("timer-expired")}
                      </span>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={
                          resendMutation.isPending ||
                          resendCount >= MAX_RESEND_ATTEMPTS
                        }
                        className="text-primary hover:text-primary-dark underline disabled:text-gray-400 disabled:no-underline"
                      >
                        {resendMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {locale === "ar" ? "جاري الإرسال..." : "Sending..."}
                          </span>
                        ) : (
                          t("resend-code")
                        )}
                      </button>
                    </div>
                  )
                ) : (
                  <span className="tabular-nums">
                    {t("timer")} {timeLeft}
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-action text-center text-sm font-medium">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="mt-9 flex flex-col items-center gap-y-4">
          <Button
            size={"long"}
            type="submit"
            disabled={mutation.isPending || mutation.isSuccess || otpExpired}
          >
            {(mutation.isPending || form.formState.isSubmitting) && (
              <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
            )}
            {mutation.isPending || form.formState.isSubmitting
              ? locale === "ar"
                ? "جاري التحقق..."
                : "Verifying..."
              : t("verify")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SendOTPForm;
