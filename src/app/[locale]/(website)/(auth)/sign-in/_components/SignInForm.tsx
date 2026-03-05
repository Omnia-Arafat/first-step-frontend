"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createSignInSchema, SignInFormData } from "@/lib/schemas";
import { initializeGoogleAuth, triggerGoogleSignIn } from "@/lib/google-auth";

const SignInForm = ({
  onSubmit,
  isLoading,
  formRef,
  onForgotPassword,
}: {
  onSubmit: (data: SignInFormData) => void;
  isLoading: boolean;
  formRef: React.RefObject<UseFormReturn<SignInFormData> | null>;
  onForgotPassword?: () => void;
}) => {
  const t = useTranslations("auth.sign-in");
  const tBtns = useTranslations("auth.buttons");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const locale = useLocale();
  const signInSchema = createSignInSchema(locale as "ar" | "en");

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [form, formRef]);

  useEffect(() => {
    // Initialize Google Sign-In
    initializeGoogleAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await triggerGoogleSignIn();
      // The loading state will be maintained until redirect
    } catch (error) {
      // Error toast is handled in google-auth helper.
    } finally {
      // On failure, always release button loading state.
      setIsGoogleLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.email.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("form.email.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.password.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("form.password.placeholder")}
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
              <FormDescription className="text-sm flex items-center gap-x-1">
                <span className="text-light-gray">
                  {t("form.forgot-password.label")}
                </span>
                {onForgotPassword ? (
                  <button
                    type="button"
                    className="text-info hover:underline"
                    onClick={onForgotPassword}
                  >
                    {t("form.forgot-password.button")}
                  </button>
                ) : (
                  <Link className="text-info" href="/forgot-password">
                    {t("form.forgot-password.button")}
                  </Link>
                )}
              </FormDescription>
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-action">{form.formState.errors.root.message}</p>
        )}

        <div className="mt-12 flex flex-col gap-y-4">
          <Button
            size={"long"}
            type="submit"
            className="h-9! px-6! py-6! rounded-md! text-base shadow-xs w-full! max-w-full!"
            disabled={isLoading || form.formState.isSubmitting}
          >
            {(isLoading || form.formState.isSubmitting) && (
              <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
            )}
            {tBtns("sign-in")}
          </Button>
          <Button
            variant={"outline"}
            size={"long"}
            type="button"
            className="h-9! px-6! py-6! rounded-md! text-base shadow-xs text-mid-gray border-light-gray! w-full! max-w-full!"
            disabled={
              isLoading || form.formState.isSubmitting || isGoogleLoading
            }
            onClick={handleGoogleSignIn}
          >
            {isGoogleLoading && (
              <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
            )}
            <span>{tBtns("sign-in-google")}</span>
            <Image
              src="/assets/icons/google_icon.svg"
              alt="Google Logo"
              width={20}
              height={20}
            />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SignInForm;
