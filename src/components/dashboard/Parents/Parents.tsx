"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/dashboardApi";
import ParentCard from "./ParentCard";
import EmptyState from "@/components/common/EmptyState";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface Child {
  id: number;
  child_name: string;
}

interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
  national_number: string;
  children_count: number;
  children: Child[];
}

interface ParentsResponse {
  parents: Parent[];
}

const ParentCardSkeleton = () => {
  return (
    <div className="relative bg-sidebar border-b border-light-gray p-6 flex flex-col lg:flex-row gap-8">
      <div className="flex flex-col gap-y-6 min-w-0">
        <div className="flex flex-col gap-2 lg:gap-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-40" />
        </div>

        <div className="flex gap-5 lg:gap-x-10">
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      <div className="flex flex-col gap-y-4 min-w-0">
        <div>
          <Skeleton className="mb-1 h-7 w-36" />
          <Skeleton className="h-5 w-28" />
        </div>

        <div>
          <Skeleton className="mb-1 h-7 w-32" />
          <div className="flex flex-col gap-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Parents = () => {
  const t = useTranslations("dashboard.emptyStates");
  const { data, isLoading } = useQuery<ParentsResponse>({
    queryKey: ["parents"],
    queryFn: adminService.getParents,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ParentCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state if no parents
  if (!data?.parents || data.parents.length === 0) {
    return (
      <EmptyState
        icon="👨‍👩‍👧‍👦"
        size="lg"
        translationKey="dashboard.emptyStates.parents"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data?.parents.map((parent) => (
        <ParentCard
          key={parent.id}
          id={parent.id}
          name={parent.name}
          email={parent.email}
          phone={parent.phone}
          national_number={parent.national_number}
          childrenCount={parent.children_count}
          children={parent.children}
        />
      ))}
    </div>
  );
};

export default Parents;
