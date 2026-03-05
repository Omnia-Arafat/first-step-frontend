"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  createParentSchema,
  type JustSignUpParentFormData,
} from "@/lib/schemas";
import PhoneInput from "../PhoneInput";

interface ParentSignUpProps {
  onCreateAccount: (data: JustSignUpParentFormData) => void;
  onAddChild: (data: JustSignUpParentFormData) => void;
  loading: {
    createAccount: boolean;
    addChild: boolean;
  };
}

export default function ParentSignUp({
  onCreateAccount,
  onAddChild,
  loading,
}: ParentSignUpProps) {
  const t = useTranslations("auth.parent-signup");
  const [showPassword, setShowPassword] = useState(false);
  const locale = useLocale();

  const methods = useForm<JustSignUpParentFormData>({
    resolver: zodResolver(createParentSchema(locale as "ar" | "en")),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      national_number: "",
    },
  });

  const { control, handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <div className="min-w-max mb-10 space-y-9">
        <h1 className="heading-2 text-primary text-center">
          {t("title", { default: "Parent Sign Up" })}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-x-10 md:gap-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.name.label")}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t("form.name.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.phone.label")}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="national_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.national-number.label")}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.national-number.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("form.address.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={t("form.address.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

          <FormField
            control={control}
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
            control={control}
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
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.password-confirm.label")}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("form.password-confirm.placeholder")}
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
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <Button
            className="w-full sm:w-auto"
            type="button"
            size="lg"
            onClick={handleSubmit(onAddChild)}
            disabled={loading.addChild || loading.createAccount}
          >
            {loading.addChild && (
              <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
            )}
            Add Child
          </Button>

          <Button
            className="border-light-gray! text-mid-gray w-full sm:w-auto"
            size="lg"
            type="button"
            variant="outline"
            disabled={loading.addChild || loading.createAccount}
            onClick={handleSubmit(onCreateAccount)}
          >
            {loading.createAccount && (
              <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
            )}
            Create Account
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
