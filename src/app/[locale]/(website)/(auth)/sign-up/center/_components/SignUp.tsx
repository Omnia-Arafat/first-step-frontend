"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { dashboardIcons } from "@/components/general/icons";
import Image from "next/image";
import Link from "next/link";

import { createCenterSchema, CenterFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/forms/PhoneInput";
import { authService } from "@/services/api";
import { CategoryService } from "@/types";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormOptionsSkeleton } from "@/components/loading/LoadingSkeletons";
import { CitySelector } from "@/components/forms/CitySelector";

export function SignUp({
  submitHandler,
  isLoading,
  formRef,
}: {
  submitHandler: (data: CenterFormData) => void;
  isLoading: boolean;
  formRef: React.RefObject<UseFormReturn<CenterFormData> | null>;
}) {
  const t = useTranslations("auth.center-signup");
  const locale = useLocale();
  const isAr = locale === "ar";

  const centerSchema = createCenterSchema(locale as "ar" | "en");

  const methods = useForm<CenterFormData>({
    resolver: zodResolver(centerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      nursery_name: "",
      city_id: "",
      logo: undefined,
      category_service_ids: [],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const phoneField = methods.register("phone");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: categoryServices = [], isLoading: categoryServicesLoading } =
    useQuery({
      queryKey: ["categoryServices"],
      queryFn: async () => {
        const services = await authService.getCategoryServices();
        // for centers: ids: 2 and 3
        return services.filter((service) => [2, 3].includes(service.id));
      },
    });

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      methods.setValue("logo", file, { shouldValidate: true });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: CenterFormData) => {
    submitHandler(data);
  };

  useEffect(() => {
    if (formRef) {
      formRef.current = methods;
    }
  }, [methods, formRef]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-10 text-3xl font-bold text-primary text-center">
        {isAr ? "تسجيل مركز جديد" : "Register New Center"}
      </h1>

      <FormProvider {...methods}>
        <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 mb-8 min-h-[400px]">
            <div className="grid grid-cols-1 gap-8">
              {/* Logo Upload - Full Width Row */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-2">
                <div className="relative w-[122px] h-[122px] shrink-0 group">
                  <div className="w-full h-full rounded-full overflow-hidden shadow-md bg-[#EEF2FF] flex items-center justify-center relative">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-[#2B3990]">
                        <dashboardIcons.userAvatar className="w-[56px] h-[56px]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <dashboardIcons.camera className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Camera Icon Overlay - Floating Outside */}
                  <div
                    className={`absolute bottom-1 ${isAr ? "left-1" : "right-1"} bg-[#2B3990] text-white p-[8px] rounded-full shadow-sm z-10 pointer-events-none flex items-center justify-center w-[36px] h-[36px] translate-y-1 ${isAr ? "-translate-x-1" : "translate-x-1"}`}
                  >
                    <dashboardIcons.camera className="w-5 h-5" />
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 rounded-full"
                    onChange={handleLogoChange}
                  />
                </div>

                <div className="text-center md:text-start space-y-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {isAr ? "شعار المركز" : "Center Logo"}
                  </h3>
                  <p
                    className="text-gray-500 mx-auto md:mx-0"
                    style={{
                      width: "245px",
                      fontSize: "12px",
                      lineHeight: "28.94px",
                      fontFamily: "Tajawal",
                      fontWeight: 400,
                    }}
                  >
                    {isAr
                      ? "قم بتحميل صورة احترافية. الحجم الموصى به 400x400 بكسل"
                      : "Upload a professional image. Recommended size 400x400 px"}
                  </p>
                  {!!methods.formState.errors.logo && (
                    <p className="text-red-500 text-xs mt-1">
                      {methods.formState.errors.logo.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="block mb-3">
                    {isAr ? "اسم المركز" : "Center Name"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...methods.register("nursery_name")}
                    placeholder={isAr ? "مثال: مركز الأمل" : "e.g. Hope Center"}
                    className="h-12"
                  />
                  {!!methods.formState.errors.nursery_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {methods.formState.errors.nursery_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block mb-3">
                    {isAr ? "المدينة" : "City"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <CitySelector
                    value={methods.watch("city_id")}
                    onChange={(value) =>
                      methods.setValue("city_id", value, {
                        shouldValidate: true,
                      })
                    }
                    placeholder={isAr ? "اختر المدينة" : "Select City"}
                    className="h-12"
                  />
                  {!!methods.formState.errors.city_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {methods.formState.errors.city_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block mb-3">
                    {isAr ? "رقم الهاتف" : "Phone Number"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    name={phoneField.name}
                    ref={phoneField.ref}
                    onBlur={phoneField.onBlur}
                    value={methods.watch("phone")}
                    onChange={(value) => {
                      methods.setValue("phone", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    placeholder="5xxxxxxxx"
                    className="h-12"
                  />
                  {!!methods.formState.errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {methods.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block mb-3">
                    {isAr ? "البريد الإلكتروني" : "Email"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...methods.register("email")}
                    type="email"
                    placeholder="example@domain.com"
                    className="h-12"
                  />
                  {!!methods.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {methods.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block mb-3">
                    {isAr ? "كلمة المرور" : "Password"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...methods.register("password")}
                    type="password"
                    className="h-12"
                  />
                  {!!methods.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {methods.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block mb-3">
                    {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...methods.register("confirmPassword")}
                    type="password"
                    className="h-12"
                  />
                  {!!methods.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {methods.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Services */}
              <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4">
                <Label className="block text-lg font-bold shrink-0">
                  {isAr
                    ? "نوع الخدمات التي تقدمها"
                    : "Type of services you provide"}
                </Label>
                {categoryServicesLoading ? (
                  <FormOptionsSkeleton />
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    {categoryServices.map((service: CategoryService) => {
                      const isSelected = (
                        methods.watch("category_service_ids") || []
                      ).includes(service.id);
                      return (
                        <div
                          key={service.id}
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            const current =
                              methods.getValues("category_service_ids") || [];
                            if (!isSelected) {
                              methods.setValue(
                                "category_service_ids",
                                [...current, service.id],
                                { shouldValidate: true },
                              );
                            } else {
                              methods.setValue(
                                "category_service_ids",
                                current.filter((id) => id !== service.id),
                                { shouldValidate: true },
                              );
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                              isSelected
                                ? "border-primary bg-white"
                                : "border-gray-200 group-hover:border-gray-300",
                            )}
                          >
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary stroke-[3.5px]" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "font-medium transition-colors text-sm",
                              isSelected
                                ? "text-gray"
                                : "text-mid-gray group-hover:text-gray",
                            )}
                          >
                            {service.name[locale as "ar" | "en"]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {!!methods.formState.errors.category_service_ids && (
                  <p className="text-red-500 text-xs mt-1">
                    {methods.formState.errors.category_service_ids.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-6 gap-4">
            <Button
              type="submit"
              className="w-full md:w-auto min-w-[200px] h-12 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isAr ? "جاري التسجيل..." : "Registering..."}
                </div>
              ) : isAr ? (
                "تسجيل"
              ) : (
                "Register"
              )}
            </Button>

            <Link
              href={`/${locale}/sign-in`}
              className="text-primary hover:underline text-sm font-medium"
            >
              {isAr
                ? "لديك حساب بالفعل؟ تسجيل الدخول"
                : "Already have an account? Sign In"}
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
