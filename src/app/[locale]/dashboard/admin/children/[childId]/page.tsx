"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/dashboardApi";
import ChildShow from "@/components/forms/dashboard/children/ChildShow";
import { Skeleton } from "@/components/ui/skeleton";

const ChildShowSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      <div className="w-full flex flex-col gap-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:p-4 xl:grid-cols-2 gap-y-4 gap-x-10">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:p-4 xl:grid-cols-2 gap-y-4 gap-x-10">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 lg:p-4 xl:grid-cols-2 gap-y-4 gap-x-10">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 lg:p-4 xl:grid-cols-2 gap-y-4 gap-x-10">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChildDetailsPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const meta = usePageMetadata();

  const { childId } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["child", childId],
    queryFn: () => adminService.getChild(childId),
    enabled: !!childId,
  });

  if (isLoading) return <ChildShowSkeleton />;
  if (error)
    return <div className="text-red-500">حدث خطأ أثناء جلب البيانات</div>;
  if (!data) return null;

  // Map API response to ChildShow's expected initialValues
  const initialValues = {
    name: data.user?.name || "",
    phone: data.user?.phone || "",
    email: data.user?.email || "",
    kinship: data.kinship || "",
    childName: data.child_name,
    birthDate: new Date(data.birthday_date),
    fatherName: data.parent_name,
    motherName: data.mother_name,
    gender: data.gender === "girl" ? "female" : "male",
    chronicDiseases: {
      hasDiseases: data.disease ? "yes" : "no",
      diseases: data.disease_details || [],
    },
    childDescription: data.description_3_words || "",
    favoriteThings: data.things_child_likes || "",
    recommendations: data.recommendations || "",
    allergies: {
      hasAllergies: data.allergy ? "yes" : "no",
      allergies: (data.allergies || []).map((a: any) => ({
        allergyTypes: a.name,
        allergyFoods: (a.allergy_causes || []).join(", "),
        allergyProcedures: a.allergy_emergency,
      })),
    },
    authorizedPersons: (data.authorized_people || []).map((p: any) => ({
      name: p.name,
      idNumber: p.cin,
    })),
    comments: data.notes || "",
  };

  return (
    <div>
      <ChildShow
        initialValues={initialValues}
        mode="show"
        noEdit
        childId={childId}
      />
    </div>
  );
}
