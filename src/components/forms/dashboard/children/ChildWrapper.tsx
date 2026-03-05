"use client";

import React from "react";
import Child from "./Child";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { showToast, toastError } from "@/lib/toast";
import { useTranslations } from "next-intl";
import { ListSkeleton } from "@/components/loading/LoadingSkeletons";

const ChildWrapper = ({
  initialValues,
  mode,
  childId,
}: {
  initialValues: any;
  mode: "add" | "edit" | "show";
  childId?: string;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("dashboard.parent.children");
  // formKey state removed - no longer needed since we don't reset form in edit mode

  // Fetch child data if in show/edit mode and childId is provided
  const { data: fetchedChild, isLoading } = useQuery({
    queryKey: ["child", childId],
    queryFn: async () => {
      if (!childId) return null;
      const { parentService } = await import("@/services/dashboardApi");
      return parentService.getChild(childId);
    },
    enabled: !!childId && mode !== "add",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { parentService } = await import("@/services/dashboardApi");
      if (mode === "edit" && childId) {
        return parentService.updateChild(childId, data);
      } else {
        return parentService.addChild(data);
      }
    },
    onSuccess: (response) => {
      // Update caches so pages reflect changes without manual refresh
      if (childId) {
        const updatedChild = response?.child ?? response;
        queryClient.setQueryData(["child", childId], updatedChild);
        queryClient.invalidateQueries({ queryKey: ["child", childId] });

        // Update parent children list cache by replacing the edited child
        queryClient.setQueryData(["parent-children"], (oldData: any) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.map((c) =>
            c?.id === updatedChild?.id ? { ...c, ...updatedChild } : c
          );
        });
      } else {
        // add mode: attempt to merge returned children into cache if available
        const createdChildren = response?.children;
        if (Array.isArray(createdChildren) && createdChildren.length > 0) {
          queryClient.setQueryData(["parent-children"], (oldData: any) => {
            const existing = Array.isArray(oldData) ? oldData : [];
            const byId = new Map(existing.map((c: any) => [c.id, c]));
            createdChildren.forEach((nc: any) => {
              if (nc && nc.id != null)
                byId.set(nc.id, { ...(byId.get(nc.id) || {}), ...nc });
            });
            return Array.from(byId.values());
          });
        }
      }
      queryClient.invalidateQueries({
        queryKey: ["parent-children"],
        refetchType: "active",
      });

      showToast({
        title:
          mode === "edit"
            ? t("messages.editSuccess")
            : t("messages.addSuccess"),
        description:
          mode === "edit"
            ? t("messages.editSuccessDescription")
            : t("messages.addSuccessDescription"),
        type: "success",
        duration: 1800,
        // className:
        //   "bg-green-50 border-green-400 text-green-900 font-bold text-lg",
      });

      // Reset form for add mode - handled by Child component now
      // No need to update formKey since we removed the key prop

      setTimeout(() => {
        router.replace("/dashboard/parent/children");
      }, 1500);
    },
    onError: (error: any) => {
      console.error("API error details:", error?.response?.data);
      console.error("Full error object:", error);

      if (error?.response?.data?.errors) {
        console.error("API validation errors:", error.response.data.errors);
        // Show detailed validation errors
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]: [string, any]) => {
            const fieldMessages = Array.isArray(messages)
              ? messages.join(", ")
              : messages;
            return `${field}: ${fieldMessages}`;
          })
          .join("\n");

        toastError("Validation Error", `Validation Errors:\n${errorMessages}`);
      } else if (error?.response?.data?.message) {
        toastError("API Error", error.response.data.message);
      } else {
        toastError("Error", error?.message || "Unknown error occurred");
      }
    },
  });

  const onSubmit = (data: any) => {
    let payload = { ...data };

    console.log("=== FORM SUBMISSION DEBUGGING ===");
    console.log("Raw form data:", data);
    console.log("Mode:", mode);
    console.log("ChildId:", childId);
    console.log("Raw allergies data:", data.allergies);
    console.log("Raw chronicDiseases data:", data.chronicDiseases);

    // Ensure kinship is always a string (API requires string)
    if (payload.kinship == null) {
      payload.kinship = "";
    } else if (typeof payload.kinship !== "string") {
      payload.kinship = String(payload.kinship);
    }

    // Remove all disease/allergy objects if 'no' is selected
    if (payload.chronicDiseases?.hasDiseases === "no") {
      payload.chronicDiseases.diseases = [];
    }
    if (payload.allergies?.hasAllergies === "no") {
      payload.allergies.allergies = [];
    }

    // Chronic Diseases
    let disease = payload.chronicDiseases.hasDiseases === "yes";
    let disease_details;
    if (!disease) {
      disease_details = [
        { disease_name: "None", medicament: null, emergency: null },
      ];
    } else {
      disease_details = payload.chronicDiseases.diseases
        .filter((d: any) => d.name && d.medication && d.procedures)
        .map((d: any) => ({
          disease_name: d.name,
          medicament: d.medication,
          emergency: d.procedures,
        }));
    }

    // Allergies
    let allergy = payload.allergies.hasAllergies === "yes";
    let allergies = [];
    if (allergy) {
      allergies = payload.allergies.allergies
        .filter(
          (a: any) => a.allergyTypes && a.allergyFoods && a.allergyProcedures
        )
        .map((a: any) => ({
          name: a.allergyTypes,
          allergy_causes: a.allergyFoods.split(/,\s*/),
          allergy_emergency: a.allergyProcedures,
        }));
    } // If allergy is false, allergies stays as []

    console.log("=== AFTER DISEASE/ALLERGY PROCESSING ===");
    console.log("Processed allergies:", allergies);
    console.log("Processed disease_details:", disease_details);
    console.log("Allergy flag:", allergy);
    console.log("Disease flag:", disease);
    console.log("=== END AFTER DISEASE/ALLERGY PROCESSING ===");

    // For edit mode, send flat payload matching update API; for add mode, keep original flow
    if (mode === "edit" && childId) {
      console.log("=== EDIT MODE PAYLOAD DEBUGGING ===");
      console.log("Raw payload before processing:", payload);
      console.log("Payload allergies:", payload.allergies);
      console.log("Payload chronicDiseases:", payload.chronicDiseases);

      const editPayload = {
        ...payload,
        birthDate:
          payload.birthDate instanceof Date
            ? payload.birthDate.toISOString().split("T")[0]
            : payload.birthDate,
        gender: payload.gender === "male" ? "boy" : "girl",
        chronicDiseases: {
          ...payload.chronicDiseases,
          diseases: disease_details.map((d: any) => ({
            name: d.disease_name,
            medication: d.medicament,
            procedures: d.emergency,
            id: d.id,
          })),
          hasDiseases: disease ? "yes" : "no",
        },
        allergies: {
          ...payload.allergies,
          allergies: allergies.map((a: any) => ({
            allergyTypes: a.name,
            allergyFoods: Array.isArray(a.allergy_causes)
              ? a.allergy_causes.join(", ")
              : a.allergy_causes,
            allergyProcedures: a.allergy_emergency,
            id: a.id,
          })),
          hasAllergies: allergy ? "yes" : "no",
        },
        fatherName: payload.fatherName,
        motherName: payload.motherName,
        childNationalNumber: payload.childNationalNumber ?? "",
        childImage: payload.childImage ?? null,
        recommendations:
          payload.recommendations && payload.recommendations.trim() !== ""
            ? payload.recommendations
            : "",
        childDescription:
          payload.childDescription && payload.childDescription.trim() !== ""
            ? payload.childDescription
            : "",
        favoriteThings:
          payload.favoriteThings && payload.favoriteThings.trim() !== ""
            ? payload.favoriteThings
            : "",
        comments:
          payload.comments && payload.comments.trim() !== ""
            ? payload.comments
            : "",
        kinship: payload.kinship ?? "",
        authorizedPersons: (payload.authorizedPersons || []).map(
          (person: any) => ({
            name: person.name,
            idNumber: person.idNumber,
            id: person.id,
          })
        ),
      };

      console.log("Final edit payload:", editPayload);
      console.log("Edit payload allergies:", editPayload.allergies);
      console.log("Edit payload chronicDiseases:", editPayload.chronicDiseases);
      console.log("=== END EDIT MODE PAYLOAD DEBUGGING ===");

      mutation.mutate(editPayload);
    } else {
      // add mode - pass payload directly since API now handles FormData
      console.log("Sending child data:", payload);
      console.log("Payload keys:", Object.keys(payload));
      console.log(
        "Payload values:",
        Object.entries(payload).map(([key, value]) => ({
          key,
          value,
          type: typeof value,
          isNull: value === null,
          isEmpty: value === "",
          isArray: Array.isArray(value),
        }))
      );
      mutation.mutate(payload);
    }
  };

  function mapFetchedChildToInitialValues(childData: any) {
    if (!childData) return initialValues;

    console.log("Raw child data from API:", childData);
    console.log("=== SPECIFIC FIELD DEBUGGING ===");
    console.log("childData.national_number:", childData.national_number);
    console.log("childData.image:", childData.image);
    console.log(
      "typeof childData.national_number:",
      typeof childData.national_number
    );
    console.log("typeof childData.image:", typeof childData.image);
    console.log("=== END SPECIFIC FIELD DEBUGGING ===");
    console.log("disease_details:", childData.disease_details);
    console.log("disease flag:", childData.disease);
    console.log("allergies:", childData.allergies);
    console.log("allergy flag:", childData.allergy);
    console.log("authorized_people:", childData.authorized_people);
    console.log("=== ALLERGIES DETAILED DEBUGGING ===");
    if (childData.allergies && Array.isArray(childData.allergies)) {
      childData.allergies.forEach((allergy: any, index: number) => {
        console.log(`Allergy ${index}:`, allergy);
        console.log(`Allergy ${index} name:`, allergy.name);
        console.log(`Allergy ${index} allergy_causes:`, allergy.allergy_causes);
        console.log(
          `Allergy ${index} allergy_emergency:`,
          allergy.allergy_emergency
        );
      });
    }
    console.log("=== END ALLERGIES DETAILED DEBUGGING ===");

    const mappedValues = {
      // Parent data
      name: childData?.user?.name || "",
      phone: childData?.user?.phone || "",
      email: childData?.user?.email || "",
      address: childData?.user?.address || "",
      // Child data
      childName: childData?.child_name || "",
      birthDate: childData?.birthday_date
        ? new Date(childData.birthday_date)
        : new Date(),
      fatherName: childData?.parent_name || "",
      motherName: childData?.mother_name || "",
      gender: childData?.gender === "boy" ? "male" : "female",
      kinship: childData?.kinship || "",
      childNationalNumber: childData?.national_number || "",
      childImage: childData?.image || null,
      qrCode: childData?.qr_code || null,
      // Chronic diseases
      chronicDiseases: {
        hasDiseases:
          childData?.disease_details &&
          childData.disease_details !== null &&
          Array.isArray(childData.disease_details) &&
          childData.disease_details.length > 0 &&
          childData.disease_details.some(
            (disease: any) =>
              disease.disease_name && disease.disease_name.trim() !== ""
          )
            ? "yes"
            : "no",
        diseases:
          childData?.disease_details && childData.disease_details !== null
            ? (typeof childData.disease_details === "string"
                ? JSON.parse(childData.disease_details)
                : childData.disease_details
              )
                .filter(
                  (disease: any) =>
                    disease.disease_name && disease.disease_name.trim() !== ""
                )
                .map((disease: any) => ({
                  id: disease.id,
                  name: disease.disease_name,
                  medication: disease.medicament,
                  procedures: disease.emergency,
                }))
            : [],
      },
      // Allergies
      allergies: {
        hasAllergies:
          childData?.allergies &&
          Array.isArray(childData.allergies) &&
          childData.allergies.length > 0 &&
          childData.allergies.some(
            (allergy: any) => allergy.name && allergy.name.trim() !== ""
          )
            ? "yes"
            : "no",
        allergies:
          childData?.allergies && Array.isArray(childData.allergies)
            ? childData.allergies
                .filter(
                  (allergy: any) => allergy.name && allergy.name.trim() !== ""
                )
                .map((allergy: any) => ({
                  id: allergy.id,
                  allergyTypes: allergy.name || "",
                  allergyFoods: Array.isArray(allergy.allergy_causes)
                    ? allergy.allergy_causes.join(", ")
                    : allergy.allergy_causes || "",
                  allergyProcedures: allergy.allergy_emergency || "",
                }))
            : [],
      },
      // Recommendations
      childDescription:
        childData?.description_3_words &&
        childData.description_3_words.trim() !== ""
          ? childData.description_3_words
          : "",
      favoriteThings:
        childData?.things_child_likes &&
        childData.things_child_likes.trim() !== ""
          ? childData.things_child_likes
          : "",
      recommendations:
        childData?.recommendations && childData.recommendations.trim() !== ""
          ? childData.recommendations
          : "",
      // Authorized persons
      authorizedPersons:
        childData?.authorized_people &&
        Array.isArray(childData.authorized_people)
          ? childData.authorized_people.map((person: any) => ({
              id: person.id,
              name: person.name || "",
              idNumber: String(person.cin ?? ""),
            }))
          : [],
      // Comments
      comments:
        childData?.notes && childData.notes.trim() !== ""
          ? childData.notes
          : "",
    };

    console.log("Mapped initial values:", mappedValues);
    console.log("=== MAPPED FIELD DEBUGGING ===");
    console.log(
      "mappedValues.childNationalNumber:",
      mappedValues.childNationalNumber
    );
    console.log("mappedValues.childImage:", mappedValues.childImage);
    console.log(
      "typeof mappedValues.childNationalNumber:",
      typeof mappedValues.childNationalNumber
    );
    console.log(
      "typeof mappedValues.childImage:",
      typeof mappedValues.childImage
    );
    console.log("=== ALLERGIES MAPPING DEBUGGING ===");
    console.log("childData.allergies:", childData.allergies);
    console.log("childData.allergies length:", childData.allergies?.length);
    console.log(
      "childData.allergies isArray:",
      Array.isArray(childData.allergies)
    );
    console.log(
      "childData.allergies has valid entries:",
      childData.allergies?.some(
        (allergy: any) => allergy.name && allergy.name.trim() !== ""
      )
    );
    console.log("mapped hasAllergies:", mappedValues.allergies.hasAllergies);
    console.log("mapped allergies array:", mappedValues.allergies.allergies);
    console.log("=== END ALLERGIES MAPPING DEBUGGING ===");
    console.log("=== END MAPPED FIELD DEBUGGING ===");
    console.log("Mapped diseases:", mappedValues.chronicDiseases);
    console.log("Mapped allergies:", mappedValues.allergies);

    return mappedValues;
  }

  // Use mapped fetched child data as initialValues if available
  const effectiveInitialValues =
    mode !== "add" && fetchedChild
      ? mapFetchedChildToInitialValues(fetchedChild)
      : initialValues;

  console.log("effectiveInitialValues:", effectiveInitialValues);
  console.log("=== EFFECTIVE VALUES DEBUGGING ===");
  console.log(
    "effectiveInitialValues.childNationalNumber:",
    effectiveInitialValues.childNationalNumber
  );
  console.log(
    "effectiveInitialValues.childImage:",
    effectiveInitialValues.childImage
  );
  console.log(
    "typeof effectiveInitialValues.childNationalNumber:",
    typeof effectiveInitialValues.childNationalNumber
  );
  console.log(
    "typeof effectiveInitialValues.childImage:",
    typeof effectiveInitialValues.childImage
  );
  console.log("=== END EFFECTIVE VALUES DEBUGGING ===");

  // Update form key when fetched data changes to ensure form resets with new data
  // But only if we haven't already set the form key for this child
  // COMMENTED OUT: This was causing the form to remount and reset user changes
  // React.useEffect(() => {
  //   if (mode !== "add" && fetchedChild) {
  //     console.log("=== FORM KEY UPDATE DEBUGGING ===");
  //     console.log("Fetched child data changed, updating form key");
  //     console.log("Current formKey:", formKey);
  //     console.log("Fetched child ID:", fetchedChild.id);
  //     console.log("=== END FORM KEY UPDATE DEBUGGING ===");
  //     setFormKey((prev) => prev + 1);
  //   }
  // }, [fetchedChild, mode, formKey]);

  if (isLoading) return <ListSkeleton count={4} />;

  return (
    <React.Fragment>
      <Child
        initialValues={effectiveInitialValues}
        mode={mode}
        onSubmit={onSubmit}
        childId={childId}
      />
    </React.Fragment>
  );
};

export default ChildWrapper;
