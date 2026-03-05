"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2 } from "lucide-react";
import { createTeamMemberSchema, TeamMemberFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { InitialData } from "./MemberFormWrapper";

const MemberForm = ({
  initialData,
  mode,
  onSubmit,
  onDelete,
  isLoading,
}: {
  initialData: InitialData;
  mode: "add" | "edit";
  onSubmit: (data: TeamMemberFormData) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard.center.team.form");
  const [preview, setPreview] = useState<string | null>(
    (typeof initialData.image === "string" && initialData.image) || null,
  );
  const [loadingButton, setLoadingButton] = useState<"save" | "delete" | null>(
    null,
  );

  const teamMemberSchema = createTeamMemberSchema(locale as "ar" | "en");

  const methods = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      ...initialData,
    },
    mode: "onChange",
  });

  const buttons = (mode: "add" | "edit") => {
    if (mode === "add") {
      return (
        <>
          <Button size={"sm"} type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />}
            {t("buttons.add")}
          </Button>
          <Button
            size={"sm"}
            variant={"outline"}
            className="border-light-gray! text-mid-gray"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {t("buttons.cancel")}
          </Button>
        </>
      );
    } else if (mode === "edit") {
      return (
        <>
          <Button
            size={"sm"}
            type="submit"
            disabled={!methods.formState.isDirty || isLoading}
            onClick={() => setLoadingButton("save")}
          >
            {isLoading && loadingButton === "save" && (
              <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
            )}
            {t("buttons.save")}
          </Button>
          <Button
            size={"sm"}
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              setLoadingButton("delete");
              onDelete && onDelete();
            }}
            disabled={isLoading}
          >
            {isLoading && loadingButton === "delete" && (
              <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
            )}
            {t("buttons.delete")}
          </Button>
        </>
      );
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className="grid sm:grid-cols-2 items-start gap-4 gap-y-6"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-y-4">
          <FormField
            control={methods.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("name.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t("name.placeholder")}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("branch.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t("branch.placeholder")}
                    {...field}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="job"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("job.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t("job.placeholder")}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={methods.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex justify-end">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPreview(URL.createObjectURL(file));
                        field.onChange(e.target.files);
                      }
                    }}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={clsx(
                      "min-w-60 md:max-w-60 aspect-200/240 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer transition-colors",
                      preview && "p-2",
                      isLoading && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {preview ? (
                      <Image
                        src={preview}
                        alt="Preview"
                        width={200}
                        height={240}
                        className="rounded-md object-cover h-full "
                      />
                    ) : (
                      <div className="text-center text-gray-500 flex flex-col items-center gap-2">
                        <ImageIcon className="w-6 h-6" />
                        <p className="text-sm">{t("image.placeholder")}</p>
                      </div>
                    )}
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sm:col-span-2 flex justify-center gap-5 lg:gap-x-10">
          {buttons(mode)}
        </div>
      </form>
    </FormProvider>
  );
};

export default MemberForm;
