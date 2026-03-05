"use client";

import { ChangeEvent, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PhoneInput from "../PhoneInput";
import CheckboxGroup from "../CheckboxGroup";
import { MultiSelect } from "@/components/ui/multi-select";
import { CitySelector } from "../CitySelector";
import { FileUploader } from "../FileUploader";
import { LocationAutocomplete } from "../LocationAutocomplete";
import type { BranchStep1FormData, CenterStep1FormData } from "@/lib/schemas";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapOptions } from "@/lib/utils";
import { CENTER_TYPE_IDS } from "@/lib/options";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/api";

export function Step1BasicInfo({
  isBranch = false,
  disabled = false,
  show = false,
}: {
  isBranch?: boolean;
  disabled?: boolean;
  show?: boolean;
}) {
  const pathname = usePathname();
  const mode: "edit" | "add" | undefined = pathname.includes("edit")
    ? "edit"
    : pathname.includes("add")
    ? "add"
    : undefined;

  const t = useTranslations("auth.center-signup.1.form");
  const locale = useLocale();
  const tOptions = useTranslations("options");

  const [showPassword, setShowPassword] = useState(false);

  type Step1FormData = BranchStep1FormData | CenterStep1FormData;

  const { control } = useFormContext<Step1FormData>();

  const { data: apiCenterTypes } = useQuery({
    queryKey: ["centerTypes"],
    queryFn: () => authService.getCenterTypes(),
  });

  const nurseryTypes = mapOptions(CENTER_TYPE_IDS, "centerTypes", tOptions);

  const centerTypes =
    apiCenterTypes && Array.isArray(apiCenterTypes)
      ? apiCenterTypes.map((type: any) => ({
          value: type.id.toString(),
          label: t(`type.options.${type.name}`) || type.name,
        }))
      : [];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-x-10 md:gap-y-4">
        {mode === "edit" || show ? null : (
          <>
            {/* Name field */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("name.label")}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("name.placeholder")}
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email field */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("email.label")}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("email.placeholder")}
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password field */}
            <FormField
              control={control}
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

            {/* Confirm Password field */}
            <FormField
              control={control}
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
          </>
        )}

        {/* Phone field */}
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("phone.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    readOnly={disabled}
                    onChange={field.onChange}
                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Nursery Name field */}
        <FormField
          control={control}
          name="nursery_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("nursery_name.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("nursery_name.placeholder")}
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location field */}
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("location.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <LocationAutocomplete
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder={t("location.placeholder")}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Neighborhood field */}
        <FormField
          control={control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("neighborhood.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("neighborhood.placeholder")}
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City field */}
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("city.label")}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <CitySelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  placeholder={t("city.placeholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selection Type field (Center / Nursery / Other) */}
        <FormField
          control={control}
          name="types"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("type.label")}</FormLabel>
              <FormControl>
                <MultiSelect
                  options={centerTypes}
                  selected={field.value || []}
                  onChange={field.onChange}
                  disabled={disabled}
                  placeholder={t("type.placeholder") || "Select types..."}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Logo field */}
      <div className="flex flex-col gap-y-3">
        <p className="form-label">{t("logo.label")}</p>
        <FormField
          control={control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FileUploader
                  value={field.value}
                  onChange={field.onChange}
                  accept="image/png, image/jpeg, image/jpg"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Nursery Type field (Specialties) */}
      <div className="flex flex-col items-center gap-y-4">
        <p className="form-label">
          {t("nursery_type.label") || "Nursery Specialties"}
        </p>
        <CheckboxGroup
          className="lg:w-3xl"
          items={nurseryTypes}
          name="nursery_type"
          control={control}
          readOnly={disabled}
        />
      </div>
    </div>
  );
}
