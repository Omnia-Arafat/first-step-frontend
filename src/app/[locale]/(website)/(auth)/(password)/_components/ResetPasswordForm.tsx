"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  createResetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/api";
import { useRouter } from "@/i18n/navigation";

const ResetPasswordForm = ({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess?: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const t = useTranslations("auth.reset-password.form");
  const tBtns = useTranslations("auth.buttons");

  const router = useRouter();
  const locale = useLocale();
  const formSchema = createResetPasswordSchema(locale as "ar" | "en");
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation<
    any, // success response
    { errors?: { password?: string[] }; message?: string }, // error type
    { email: string; password: string } // input type
  >({
    mutationFn: async ({ email, password }) => {
      return await authService.resetPassword(email, password);
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/sign-in");
      }
    },
    onError: (error) => {
      if (error?.errors?.password?.length) {
        form.setError("password", {
          type: "server",
          message: error.errors.password[0],
        });
      } else {
        form.setError("root", {
          type: "server",
          message: error.message || "خطأ غير متوقع",
        });
      }
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    mutation.mutate({ email, password: data.password });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("password.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password.placeholder")}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 stroke-neutral-500 hover:stroke-neutral-600 duration-300"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-6 stroke-inherit" />
                    ) : (
                      <Eye className="size-6 stroke-inherit" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("password-confirm.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password-confirm.placeholder")}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 stroke-neutral-500 hover:stroke-neutral-600 duration-300"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-6 stroke-inherit" />
                    ) : (
                      <Eye className="size-6 stroke-inherit" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-destructive text-sm font-medium text-center">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="mt-12 flex flex-col items-center gap-y-4">
          <Button
            size={"long"}
            type="submit"
            disabled={
              mutation.isPending ||
              mutation.isSuccess ||
              !form.formState.isValid
            }
          >
            {(mutation.isPending ||
              mutation.isSuccess ||
              form.formState.isSubmitting) && (
              <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
            )}
            {mutation.isPending || form.formState.isSubmitting
              ? locale === "ar"
                ? "جاري التحديث..."
                : "Updating..."
              : locale === "ar"
              ? "إعادة تعيين كلمة السر"
              : "Reset Password"}
          </Button>
          <Button
            variant={"outline"}
            size={"long"}
            type="button"
            className="text-mid-gray border-light-gray!"
            disabled={mutation.isPending || mutation.isSuccess}
          >
            <span>{tBtns("sign-in-google")}</span>
            <Image
              src="/assets/icons/google_icon.svg"
              alt="Google Logo"
              width={36}
              height={36}
            />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
