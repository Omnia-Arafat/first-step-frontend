"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, X } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { useAuthUser } from "@/store/authStore";
import { Label } from "../ui/label";

import { CitySelector } from "@/components/forms/CitySelector";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";
import PhoneInput from "../forms/PhoneInput";
import { useRouter } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authService } from "@/services/api";

interface ProfileField {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

interface EditProfileProps {
  title: string;
  fields: ProfileField[];
  onSave: (data: any) => Promise<void>;
  initialData?: Record<string, any>;
  schema: ZodTypeAny;
}

export default function EditProfile({
  title,
  fields,
  onSave,
  initialData = {},
  schema,
}: EditProfileProps) {
  const t = useTranslations("dashboard.account");
  const locale = useLocale();
  const user = useAuthUser();
  const router = useRouter();

  const defaultValues: Record<string, any> = (() => {
    const data: Record<string, any> = {};
    fields.forEach((field) => {
      data[field.key] =
        initialData[field.key] ||
        (user?.[field.key as keyof typeof user] as any) ||
        "";
    });
    return data;
  })();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<Record<string, any>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [confirmOpen, setConfirmOpen] = useState(false as boolean);
  const [confirmLoading, setConfirmLoading] = useState(false as boolean);
  const [pendingData, setPendingData] = useState<Record<string, any> | null>(
    null
  );
  const [password, setPassword] = useState("");

  // Ensure form reflects latest initial data when it loads/changes, but avoid infinite loops
  const lastSnapshotRef = useRef<string>("");
  useEffect(() => {
    const nextValues: Record<string, any> = {};
    fields.forEach((field) => {
      nextValues[field.key] = initialData[field.key] ?? "";
    });
    const snapshot = JSON.stringify(nextValues);
    if (snapshot !== lastSnapshotRef.current) {
      reset(nextValues, { keepDirty: false, keepValues: false });
      lastSnapshotRef.current = snapshot;
    }
  }, [initialData, fields, reset]);

  const onSubmit = handleSubmit(() => {
    // Get all form values
    const allValues = getValues();
    // Filter only the dirty fields
    const dirtyValues = Object.keys(dirtyFields).reduce((acc, key) => {
      acc[key] = allValues[key];
      return acc;
    }, {} as Record<string, any>);

    setPendingData(dirtyValues);
    setConfirmOpen(true);
  });

  const handleConfirmPassword = async () => {
    if (!pendingData) return;
    try {
      setConfirmLoading(true);
      const res = await authService.confirmPassword(password);
      if (
        res?.message &&
        res.message.toLowerCase().includes("does not match")
      ) {
        toastError("Authentication Failed", res.message);
        return;
      }
      await onSave(pendingData);
      toastSuccess(
        t("success.saved"),
        "Your profile has been updated successfully"
      );
      setConfirmOpen(false);
      setPassword("");
      setPendingData(null);
    } catch (error: any) {
      toastError("Save Failed", error?.message || t("errors.saveFailed"));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    router.back();
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-4 text-primary mb-4">{title}</h1>
        </div>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("confirm.title") || "تأكيد كلمة المرور"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                {t("confirm.passwordLabel") || "أدخل كلمة المرور للتأكيد"}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("confirm.passwordPlaceholder") || "••••••••"}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={confirmLoading}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                onClick={handleConfirmPassword}
                disabled={!password || confirmLoading}
              >
                {confirmLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {t("buttons.confirm") || "تأكيد"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Form Container */}
        <form onSubmit={onSubmit} className="">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {fields.map((field) => {
              const isCityField =
                field.key === "city" || field.key === "city_id";

              const isPhoneField =
                field.key === "phone" || field.type === "tel";

              return (
                <div key={field.key} className={`space-y-3`}>
                  <Label htmlFor={field.key} className="text-base">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 mr-1">*</span>
                    )}
                  </Label>
                  <div className="relative">
                    {isCityField ? (
                      <Controller
                        name={field.key}
                        control={control}
                        render={({ field: controllerField }) => (
                          <CitySelector
                            value={controllerField.value.toString() || ""}
                            onChange={(value) =>
                              controllerField.onChange(parseInt(value))
                            }
                            placeholder={field.placeholder}
                          />
                        )}
                      />
                    ) : null}

                    {isPhoneField ? (
                      <Controller
                        name={field.key}
                        control={control}
                        render={({ field: controllerField }) => (
                          <PhoneInput
                            {...controllerField}
                            onChange={controllerField.onChange}
                          />
                        )}
                      />
                    ) : null}

                    {!isCityField && !isPhoneField ? (
                      <Input
                        id={field.key}
                        type={field.type || "text"}
                        placeholder={field.placeholder || field.label}
                        {...register(field.key)}
                      />
                    ) : null}
                    {errors[field.key]?.message && (
                      <div className="absolute -bottom-6 ltr:left-0 rtl:right-0 text-sm text-red-500 flex items-center gap-1 mt-1">
                        {String(errors[field.key]?.message)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 pt-8 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              size={"sm"}
              type="button"
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              disabled={isSubmitting || Object.keys(dirtyFields).length === 0}
              size={"sm"}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  {t("buttons.saving")}
                </>
              ) : (
                <>{t("buttons.save")}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
