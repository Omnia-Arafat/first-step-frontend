import { Skeleton } from "@/components/ui/skeleton";

const FieldSkeleton = ({ fullWidth = false }: { fullWidth?: boolean }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  </div>
);

export default function BranchFormSkeleton() {
  return (
    <div className="space-y-10">
      {/* Step 1: Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-x-10 md:gap-y-4">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>

      {/* Step 2 & 3: Type and Services */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-24 mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-24 mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Step 4: Additional Services */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-5 lg:gap-x-10">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
    </div>
  );
}
