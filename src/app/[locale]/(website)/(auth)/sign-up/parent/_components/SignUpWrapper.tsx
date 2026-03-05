"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/api";
import { ParentRegisterPayloadv2 } from "@/types";
import ParentSignUp from "@/components/forms/parent/ParentSignUp";
import Step1ChildInfo from "@/components/forms/child/Step1";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  createChildStep1Schema,
  JustSignUpParentFormData,
  type ChildStep1FormData,
} from "@/lib/schemas";
import { ApiError } from "@/lib/error-handling";
import { toastSuccess, toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import EnrollmentModal from "@/components/modals/EnrollmentModal";
import { trackSignUp } from "@/lib/snapchatPixel";

const SignUpWrapper = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.parent-signup");
  const [parentAccountCreated, setParentAccountCreated] = useState(false);
  const [savedChildren, setSavedChildren] = useState<ChildStep1FormData[]>([]);
  const [registeredChildren, setRegisteredChildren] = useState<
    Array<{ id: number; name: string; image?: string }>
  >([]);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  // Child form setup
  const childMethods = useForm<ChildStep1FormData>({
    resolver: zodResolver(createChildStep1Schema(locale as "ar" | "en")),
    mode: "onChange",
    defaultValues: {
      childName: "",
      childNationalNumber: "",
      birthDate: undefined,
      fatherName: "",
      motherName: "",
      kinship: "",
      gender: undefined,
      childImage: undefined,
    },
  });

  // Helper function to handle API errors
  const handleApiError = (error: ApiError) => {
    console.error("Registration failed:", error);

    if (error.errors && Object.keys(error.errors).length > 0) {
      const firstError = Object.values(error.errors)[0];
      const firstErrorMessage = Array.isArray(firstError)
        ? firstError[0]
        : firstError;
      toastError(
        "Registration Failed",
        firstErrorMessage || "Please check your information and try again.",
      );
    } else {
      toastError(
        "Registration Failed",
        error.message || "Please check your information and try again.",
      );
    }
  };

  // Single React Query mutation for parent registration
  const parentRegistrationMutation = useMutation<
    any,
    ApiError,
    { payload: ParentRegisterPayloadv2; showChildForm: boolean }
  >({
    mutationFn: async ({ payload }) => {
      return await authService.registerParentv2(payload);
    },
    onSuccess: (response, { showChildForm }) => {
      // Store token and user data from sign-up response
      if (response.token && response.data) {
        useAuthStore.getState().setUserToken(response.data, response.token);
      }

      if (showChildForm) {
        toastSuccess(
          "Account Created Successfully!",
          "Now you can add your child's information.",
        );
        setParentAccountCreated(true);
      } else {
        // Show enrollment modal instead of redirecting
        setShowEnrollmentModal(true);
      }

      // Track Sign Up
      trackSignUp({
        sign_up_method: "Email",
        user_email: response.data.email,
        user_phone_number: response.data.phone,
      });
    },
    onError: handleApiError,
  });

  useEffect(() => {
    router.prefetch(`/${locale}/sign-in`);
  }, [locale, router]);

  // Handler for parent-only registration
  const handleCreateAccountWithoutChild = (data: JustSignUpParentFormData) => {
    const payload: ParentRegisterPayloadv2 = {
      name: data.name,
      email: data.email,
      national_number: data.national_number,
      phone: data.phone,
      password: data.password,
    };

    parentRegistrationMutation.mutate({
      payload,
      showChildForm: false,
    });
  };

  // Handler for "Add Child" - creates parent account first, then shows child form
  const handleAddChild = (data: JustSignUpParentFormData) => {
    const payload: ParentRegisterPayloadv2 = {
      name: data.name,
      email: data.email,
      national_number: data.national_number,
      phone: data.phone,
      password: data.password,
    };

    parentRegistrationMutation.mutate({
      payload,
      showChildForm: true,
    });
  };

  // Handler for adding another child (saves current and resets form)
  const handleAddAnotherChild = (data: ChildStep1FormData) => {
    setSavedChildren((prev) => [...prev, data]);
    childMethods.reset();
    toastSuccess(
      t("child-added-title", { default: "Child Added!" }),
      t("child-added-message", {
        default: "Child information saved. You can add another child.",
      }),
    );
  };

  // Handler for removing a saved child
  const handleRemoveChild = (index: number) => {
    setSavedChildren((prev) => prev.filter((_, i) => i !== index));
    toastSuccess(
      t("child-removed-title", { default: "Child Removed" }),
      t("child-removed-message", { default: "Child has been removed." }),
    );
  };

  // Mutation for submitting all children
  const addChildrenMutation = useMutation<
    any,
    ApiError,
    { formData: FormData; allChildren: ChildStep1FormData[] }
  >({
    mutationFn: async ({ formData }) => {
      return await authService.addChildren(formData);
    },
    onSuccess: (response, { allChildren }) => {
      toastSuccess(
        t("children-saved-title", { default: "Success!" }),
        t("children-saved-message", {
          default: "All children have been registered successfully.",
        }),
      );

      // Extract children data from API response
      const childrenData =
        response?.data?.children ||
        response?.children ||
        response?.data ||
        response;

      if (childrenData && Array.isArray(childrenData)) {
        const childrenWithIds = childrenData.map(
          (child: any, index: number) => ({
            id: child.id,
            name:
              child.child_name || child.name || allChildren[index]?.childName,
            image: allChildren[index]?.childImage
              ? URL.createObjectURL(allChildren[index].childImage)
              : undefined,
          }),
        );
        setRegisteredChildren(childrenWithIds);
      }

      // Update savedChildren with all submitted children
      setSavedChildren(allChildren);
      // Show enrollment modal after adding children
      setShowEnrollmentModal(true);
    },
    onError: (error) => {
      console.error("Failed to add children:", error);
      toastError(
        t("children-error-title", { default: "Registration Failed" }),
        error.message ||
          t("children-error-message", {
            default: "Failed to register children. Please try again.",
          }),
      );
    },
  });

  // Handler for final submission of all children
  const handleSubmitAllChildren = (lastChild?: ChildStep1FormData) => {
    // If lastChild is provided, include it; otherwise just use saved children
    const allChildren = lastChild
      ? [...savedChildren, lastChild]
      : savedChildren;

    if (allChildren.length === 0) {
      toastError(
        t("no-children-title", { default: "No Children" }),
        t("no-children-message", {
          default: "Please add at least one child before submitting.",
        }),
      );
      return;
    }

    // Create FormData for multipart/form-data
    const formData = new FormData();

    allChildren.forEach((child, index) => {
      formData.append(`children[${index}][child_name]`, child.childName);
      formData.append(
        `children[${index}][birthday_date]`,
        child.birthDate?.toISOString().split("T")[0] || "",
      );
      formData.append(`children[${index}][parent_name]`, child.fatherName);
      formData.append(`children[${index}][mother_name]`, child.motherName);
      formData.append(`children[${index}][kinship]`, child.kinship || "");
      // Map gender values: male -> boy, female -> girl
      const genderValue =
        child.gender === "male"
          ? "boy"
          : child.gender === "female"
            ? "girl"
            : "";
      formData.append(`children[${index}][gender]`, genderValue);
      formData.append(
        `children[${index}][national_number]`,
        child.childNationalNumber || "",
      );
      if (child.childImage) {
        formData.append(`children[${index}][image]`, child.childImage);
      }
    });

    addChildrenMutation.mutate({ formData, allChildren });
  };

  // Handler for submitting only saved children (without validating current form)
  const handleSubmitSavedChildren = () => {
    handleSubmitAllChildren();
  };

  return (
    <>
      <div className="flex flex-col container mx-auto px-4">
        {!parentAccountCreated ? (
          <ParentSignUp
            onCreateAccount={handleCreateAccountWithoutChild}
            onAddChild={handleAddChild}
            loading={{
              createAccount: parentRegistrationMutation.isPending,
              addChild: parentRegistrationMutation.isPending,
            }}
          />
        ) : (
          <FormProvider {...childMethods}>
            <form
              className="w-full"
              onSubmit={childMethods.handleSubmit(handleSubmitAllChildren)}
            >
              <div className="p-5 sm:p-10 rounded-3xl border border-secondary-burgundy">
                <div className="mb-6">
                  <h2 className="heading-3 text-primary text-center mb-2">
                    {t("child-form-title")}
                  </h2>
                  <p className="text-center text-gray-600">
                    {t("child-form-subtitle")}
                  </p>
                </div>

                {/* Saved children cards */}
                {savedChildren.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">
                      {t("saved-children")} ({savedChildren.length})
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {savedChildren.map((child, index) => (
                        <div key={index} className="relative group">
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(index)}
                            className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                            aria-label="Remove child"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <div className="flex flex-col items-center gap-2 p-4 border-2 border-secondary-mint-green rounded-2xl bg-white hover:shadow-md transition-shadow duration-200 min-w-[120px]">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-secondary-mint-green bg-gray-100">
                              {child.childImage ? (
                                <img
                                  src={URL.createObjectURL(child.childImage)}
                                  alt={child.childName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary-mint-green/10">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-secondary-mint-green"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="font-semibold text-primary text-center text-sm line-clamp-2">
                              {child.childName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Step1ChildInfo />

                {/* Child form action buttons */}
                <div className="mt-8 flex justify-center gap-4">
                  <Button
                    className="border-light-gray! text-mid-gray w-full sm:w-auto"
                    size="lg"
                    type="button"
                    variant="outline"
                    onClick={childMethods.handleSubmit(handleAddAnotherChild)}
                    disabled={addChildrenMutation.isPending}
                  >
                    {t("add-another")}
                  </Button>

                  <Button
                    className="w-full sm:w-auto"
                    size="lg"
                    type="button"
                    onClick={async () => {
                      // Check if form has any values
                      const formValues = childMethods.getValues();
                      const isFormFilled =
                        formValues.childName || formValues.birthDate;

                      if (isFormFilled) {
                        // Validate and submit with current form data
                        childMethods.handleSubmit(handleSubmitAllChildren)();
                      } else if (savedChildren.length > 0) {
                        // Submit only saved children
                        handleSubmitAllChildren();
                      } else {
                        // No children to submit
                        toastError(
                          t("no-children-title", { default: "No Children" }),
                          t("no-children-message", {
                            default:
                              "Please add at least one child before submitting.",
                          }),
                        );
                      }
                    }}
                    disabled={addChildrenMutation.isPending}
                  >
                    {addChildrenMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
                    )}
                    {t("save-child")}
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        )}
      </div>

      {showEnrollmentModal && (
        <EnrollmentModal
          open={showEnrollmentModal}
          onAddChild={() => {
            setShowEnrollmentModal(false);
            setParentAccountCreated(true);
          }}
          hasChildren={registeredChildren.length > 0}
          children={registeredChildren}
        />
      )}
    </>
  );
};

export default SignUpWrapper;
