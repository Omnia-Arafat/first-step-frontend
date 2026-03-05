"use client";

import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Control, FormProvider, useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PhoneInput from "../../PhoneInput";
import DatePicker from "@/components/general/DatePicker";
import { Allergy, ChronicDisease } from "@/types";
import { createSignUpParentSchema, SignUpParentFormData } from "@/lib/schemas";
import { useFormContext } from "react-hook-form";

// Helper function to check if a value exists and is not empty
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return Boolean(value);
};

const ChildShow = ({
  initialValues,
  mode,
  childId,
  noEdit,
}: {
  initialValues: any;
  mode: "add" | "edit" | "show";
  childId?: string;
  noEdit?: boolean;
}) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard.shared.children.form");
  const signUpParentSchema = createSignUpParentSchema(locale as "ar" | "en");

  const isReadOnly = mode === "show";

  const methods = useForm<SignUpParentFormData>({
    resolver: zodResolver(signUpParentSchema),
    defaultValues: {
      ...initialValues,
      authorizedPersons: initialValues.authorizedPersons,
    },
    mode: "onChange",
  });

  const hasDiseases = methods.watch("chronicDiseases.hasDiseases");
  const diseases = methods.watch("chronicDiseases.diseases");
  const hasAllergies = methods.watch("allergies.hasAllergies");
  const allergies = methods.watch("allergies.allergies");
  const authorizedPersons = methods.watch("authorizedPersons");

  return (
    <FormProvider {...methods}>
      <form className="w-full space-y-6">
        <ParentPart
          control={methods.control}
          locale={locale}
          readOnly={isReadOnly}
        />

        <ChildPart
          control={methods.control}
          locale={locale}
          readOnly={isReadOnly}
        />

        {hasDiseases === "yes" && (
          <DiseasesPart
            control={methods.control}
            locale={locale}
            hasDiseases={hasDiseases}
            diseases={diseases}
            readOnly={isReadOnly}
          />
        )}

        {hasAllergies === "yes" && (
          <AllergiesPart
            control={methods.control}
            locale={locale}
            hasAllergies={hasAllergies}
            allergies={allergies}
            readOnly={isReadOnly}
          />
        )}

        <Recommendations
          control={methods.control}
          locale={locale}
          readOnly={isReadOnly}
        />

        <AuthorizationPart
          control={methods.control}
          locale={locale}
          authorizedPersons={authorizedPersons}
          readOnly={isReadOnly}
        />

        {childId && (
          <div className="flex justify-center gap-5 lg:gap-x-10">
            {!noEdit && (
              <Button asChild size={"sm"}>
                <Link href={`${childId}/edit`}>{t("buttons.edit")}</Link>
              </Button>
            )}
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
            >
              {t("buttons.cancel")}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default ChildShow;

const ParentPart = ({
  control,
  locale,
  readOnly,
}: {
  control: Control<SignUpParentFormData>;
  locale: string;
  readOnly: boolean;
}) => {
  const t = useTranslations("auth.parent-signup.form");
  const sectionT = useTranslations("dashboard.center.children.form.sections");
  const { watch } = useFormContext<SignUpParentFormData>();
  
  const name = watch("name");
  const phone = watch("phone");
  const kinship = watch("kinship");
  const email = watch("email");

  return (
    <div className="w-full flex flex-col gap-y-4">
      <h2 className="heading-4 font-medium text-primary">
        {sectionT("parent")}
      </h2>

      <div className="grid grid-cols-1 lg:p-4 xl:grid-cols-2 gap-y-4 gap-x-10">
        {(!readOnly || hasValue(name)) && (
          <FormField
            control={control}
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
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!readOnly || hasValue(phone)) && (
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("phone.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <PhoneInput
                    {...field}
                    readOnly={readOnly}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!readOnly || hasValue(kinship)) && (
          <FormField
            control={control}
            name="kinship"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("kinship.label")}</span>
                </Label>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t("kinship.placeholder")}
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!readOnly || hasValue(email)) && (
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("email.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("name.placeholder")}
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};

const ChildPart = ({
  control,
  locale,
  readOnly,
}: {
  control: Control<SignUpParentFormData>;
  locale: string;
  readOnly: boolean;
}) => {
  const t = useTranslations("auth.add-child.1.form");
  const sectionT = useTranslations("dashboard.center.children.form.sections");
  const { watch, getValues } = useFormContext<SignUpParentFormData>();
  
  const childName = watch("childName");
  const birthDate = watch("birthDate");
  const fatherName = watch("fatherName");
  const motherName = watch("motherName");
  const childImage = watch("childImage");
  const qrCode = (getValues() as any)?.qrCode || null;

  return (
    <div className="w-full flex flex-col gap-y-4">
      <h2 className="heading-4 font-medium text-primary">
        {sectionT("child")}
      </h2>

      <div className="grid grid-cols-1 lg:p-4 xl:grid-cols-2 gap-y-4 gap-x-10">
        {(!readOnly || hasValue(childName)) && (
          <FormField
            control={control}
            name="childName"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("name.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    placeholder={t("name.placeholder")}
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!readOnly || hasValue(birthDate)) && (
          <FormField
            control={control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("date-of-birth.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                {!readOnly ? (
                  <DatePicker value={field.value} onChange={field.onChange} />
                ) : (
                  <Input
                    placeholder={t("name.placeholder")}
                    {...field}
                    value={field.value.toLocaleDateString()}
                    disabled={readOnly}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!readOnly || hasValue(fatherName)) && (
          <FormField
            control={control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("father-name.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    placeholder={t("father-name.placeholder")}
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!readOnly || hasValue(motherName)) && (
          <FormField
            control={control}
            name="motherName"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("mother-name.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    placeholder={t("mother-name.placeholder")}
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Three Cards Section: Gender, QR Code, Child Photo */}
        <div className="col-span-1 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Gender Selection Card */}
            <div className="flex flex-col">
              <p className="form-label-sm mb-4 text-center">
                {t("gender.label")}
              </p>
              <FormField
                control={control}
                name="gender"
                render={({ field }) => (
                  <>
                    <div className="flex justify-center gap-4">
                      <div className="group flex flex-col items-center">
                        <label
                          className={`cursor-pointer p-4 px-5.5 border rounded-2xl hover:border-secondary-mint-green duration-300 ${
                            field.value === "male"
                              ? "border-secondary-mint-green"
                              : "border-light-gray"
                          }`}
                        >
                          <input
                            type="radio"
                            className="sr-only peer"
                            value="male"
                            checked={field.value === "male"}
                            onChange={() => field.onChange("male")}
                            disabled={readOnly}
                          />
                          <div className="group relative transition-all duration-300 peer-checked:saturate-100 group-hover:saturate-100 saturate-0">
                            <Image
                              src="/assets/illustrations/boy.png"
                              alt="Boy"
                              width={91.32}
                              height={120}
                              className="group-hover:scale-110 duration-300"
                            />
                          </div>
                          <p className="text-xl font-medium text-center mt-2 text-mid-gray peer-checked:text-primary hover:text-primary duration-300">
                            {t("gender.male")}
                          </p>
                        </label>
                      </div>

                      <div className="group flex flex-col items-center">
                        <label
                          className={`cursor-pointer p-4 px-6.5 border rounded-2xl hover:border-secondary-burgundy duration-300 ${
                            field.value === "female"
                              ? "border-secondary-burgundy"
                              : "border-light-gray"
                          }`}
                        >
                          <input
                            type="radio"
                            className="sr-only peer"
                            value="female"
                            checked={field.value === "female"}
                            onChange={() => field.onChange("female")}
                            disabled={readOnly}
                          />
                          <div className="group relative transition-all duration-300 peer-checked:saturate-100 group-hover:saturate-100 saturate-0">
                            <Image
                              src="/assets/illustrations/girl.png"
                              alt="Girl"
                              width={84.74}
                              height={120}
                              className="group-hover:scale-110 duration-300"
                            />
                          </div>
                          <p className="text-xl font-medium text-center mt-2 text-mid-gray peer-checked:text-primary hover:text-primary duration-300">
                            {t("gender.female")}
                          </p>
                        </label>
                      </div>
                    </div>
                    <FormMessage />
                  </>
                )}
              />
            </div>

            {/* QR Code Card */}
            {(!readOnly || hasValue(qrCode)) && (
              <div className="flex flex-col">
                <Label className="mb-4 text-center">
                  <span className="text-base">QR code</span>
                </Label>
                <div className="relative flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors duration-200 min-h-[200px] flex items-center justify-center bg-gray-50">
                    {qrCode && typeof qrCode === "string" ? (
                      <div className="space-y-2">
                        <div className="relative inline-block">
                          <img
                            src={
                              qrCode.startsWith("http") ||
                              qrCode.startsWith("//")
                                ? qrCode
                                : `${
                                    process.env.NEXT_PUBLIC_API_BASE_URL
                                  }/${qrCode.replace(/^\//, "")}`
                            }
                            alt="QR Code"
                            className="w-40 h-40 object-contain mx-auto border-2 border-orange-300 rounded-lg shadow-lg bg-white p-2"
                            onError={(e) => {
                              // Hide image on error
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Child Image Card */}
            {(!readOnly || hasValue(childImage)) && (
              <FormField
                control={control}
                name="childImage"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label className="mb-4 text-center">
                      <span className="text-base">صورة الطفل</span>
                    </Label>
                    <FormControl>
                      <div className="relative flex-1">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors duration-200 min-h-[200px] flex items-center justify-center bg-gray-50">
                          {field.value ? (
                            <div className="space-y-2">
                              <div className="relative inline-block">
                                <img
                                  src={
                                    field.value instanceof File
                                      ? URL.createObjectURL(field.value)
                                      : (field.value as string).startsWith(
                                          "http"
                                        )
                                      ? field.value
                                      : `${
                                          process.env.NEXT_PUBLIC_API_BASE_URL
                                        }/${(field.value as string).replace(
                                          /^\//,
                                          ""
                                        )}`
                                  }
                                  alt="Child preview"
                                  className="w-24 h-24 object-cover rounded-full mx-auto border-4 border-white shadow-lg"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DiseasesPart = ({
  control,
  locale,
  hasDiseases,
  diseases,
  readOnly,
}: {
  control: Control<SignUpParentFormData>;
  locale: string;
  hasDiseases: "yes" | "no";
  diseases: ChronicDisease[] | undefined;
  readOnly: boolean;
}) => {
  const t = useTranslations("auth.add-child.2.form.diseases");
  const sectionT = useTranslations("dashboard.center.children.form.sections");

  return (
    <div className="w-full flex flex-col gap-y-4">
      <h2 className="heading-4 font-medium text-primary">
        {sectionT("diseases")}
      </h2>

      {hasDiseases === "yes" &&
        diseases!.map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:p-6"
          >
            <FormField
              control={control}
              name={`chronicDiseases.diseases.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <Label>
                    <span className="text-base">{t("disease.label")}</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("disease.placeholder")}
                      {...field}
                      value={field.value?.toString() || ""}
                      className=""
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`chronicDiseases.diseases.${index}.medication`}
              render={({ field }) => (
                <FormItem>
                  <Label>
                    <span className="text-base">{t("medicine.label")}</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("medicine.placeholder")}
                      {...field}
                      value={field.value?.toString() || ""}
                      className=""
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`chronicDiseases.diseases.${index}.procedures`}
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <Label>
                    <span className="text-base">{t("procedures.label")}</span>
                    <span className="font-normal text-sm md:text-base text-mid-gray">
                      {t("procedures.sublabel")}
                    </span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("procedures.placeholder")}
                      {...field}
                      value={field.value?.toString() || ""}
                      className=""
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
    </div>
  );
};

const AllergiesPart = ({
  control,
  locale,
  hasAllergies,
  allergies,
  readOnly,
}: {
  control: Control<SignUpParentFormData>;
  locale: string;
  hasAllergies: "yes" | "no";
  allergies: Allergy[] | undefined;
  readOnly: boolean;
}) => {
  const t = useTranslations("auth.add-child.2.form.allergies");
  const sectionT = useTranslations("dashboard.center.children.form.sections");

  return (
    <div className="w-full flex flex-col gap-y-4">
      <h2 className="heading-4 font-medium text-primary">
        {sectionT("allergies")}
      </h2>

      {hasAllergies === "yes" &&
        allergies!.map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:p-6"
          >
            <FormField
              control={control}
              name={`allergies.allergies.${index}.allergyTypes`}
              render={({ field }) => (
                <FormItem>
                  <Label>
                    <span className="text-base">{t("allergy.label")}</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("allergy.placeholder")}
                      {...field}
                      className=""
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`allergies.allergies.${index}.allergyFoods`}
              render={({ field }) => (
                <FormItem>
                  <Label>
                    <span className="text-base">{t("causes.label")}</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("causes.placeholder")}
                      {...field}
                      className=""
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`allergies.allergies.${index}.allergyProcedures`}
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <Label>
                    <span className="text-base">{t("procedures.label")}</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      placeholder={t("procedures.placeholder")}
                      {...field}
                      className=""
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
    </div>
  );
};

const Recommendations = ({
  control,
  locale,
  readOnly,
}: {
  control: Control<SignUpParentFormData>;
  locale: string;
  readOnly: boolean;
}) => {
  const t = useTranslations("auth.add-child.3.form");
  const sectionT = useTranslations("dashboard.center.children.form.sections");
  const { watch } = useFormContext<SignUpParentFormData>();
  
  const childDescription = watch("childDescription");
  const favoriteThings = watch("favoriteThings");
  const recommendations = watch("recommendations");

  // In readOnly mode, only show section if at least one field has value
  if (
    readOnly &&
    !hasValue(childDescription) &&
    !hasValue(favoriteThings) &&
    !hasValue(recommendations)
  ) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-y-4">
      <h2 className="heading-4 font-medium text-primary">
        {sectionT("recommendations")}
      </h2>

      <div className="grid grid-cols-1 lg:p-4 xl:grid-cols-2 gap-y-4 gap-x-10">
        {(!readOnly || hasValue(childDescription)) && (
          <FormField
            control={control}
            name="childDescription"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("description.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    placeholder={t("description.placeholder")}
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!readOnly || hasValue(favoriteThings)) && (
          <FormField
            control={control}
            name="favoriteThings"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("likes.label")}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <FormControl>
                  <Input
                    placeholder={t("likes.placeholder")}
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!readOnly || hasValue(recommendations)) && (
          <FormField
            control={control}
            name="recommendations"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <span className="text-base">{t("recommendations.label")}</span>
                <FormControl>
                  <Textarea
                    placeholder={t("recommendations.placeholder")}
                    {...field}
                    className="min-h-[150px]"
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};

const AuthorizationPart = ({
  control,
  locale,
  authorizedPersons,
  readOnly,
}: {
  control: Control<SignUpParentFormData>;
  locale: string;
  authorizedPersons: { name: string; idNumber: string }[];
  readOnly: boolean;
}) => {
  const t = useTranslations("auth.add-child.4.form");
  const sectionT = useTranslations("dashboard.center.children.form.sections");
  const { watch } = useFormContext<SignUpParentFormData>();
  const comments = watch("comments");

  // Filter authorized persons to only show those with data in readOnly mode
  const validAuthorizedPersons = readOnly
    ? authorizedPersons?.filter(
        (person) => hasValue(person.name) || hasValue(person.idNumber)
      ) || []
    : authorizedPersons || [];

  // In readOnly mode, only show section if there are valid authorized persons or comments
  if (readOnly && validAuthorizedPersons.length === 0 && !hasValue(comments)) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-y-4">
      <h2 className="heading-4 font-medium text-primary">
        {sectionT("authorized")}
      </h2>
      {validAuthorizedPersons.length > 0 && (
        <div className="space-y-6 lg:p-6 lg:pb-0">
          {validAuthorizedPersons.map((_, index) => (
            <div key={index} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name={`authorizedPersons.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>
                        <span className="text-base">{t("authorize.label")}</span>
                        {index > 0 ? ` ${index + 1}` : ""}
                        <span className="text-red-500">*</span>
                      </Label>
                      <FormControl>
                        <Input
                          placeholder={t("authorize.placeholder")}
                          {...field}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`authorizedPersons.${index}.idNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>
                        <span className="text-base">{t("identity.label")}</span>
                        {index > 0 ? ` ${index + 1}` : ""}
                        <span className="text-red-500">*</span>
                      </Label>
                      <FormControl>
                        <Input
                          placeholder={t("identity.placeholder")}
                          {...field}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {(!readOnly || hasValue(comments)) && (
        <div className="lg:px-6">
          <FormField
            control={control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <Label>
                  <span className="text-base">{t("comment.label")}</span>
                </Label>
                <FormControl>
                  <Textarea
                    placeholder={t("comment.placeholder")}
                    {...field}
                    className="min-h-[100px]"
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
