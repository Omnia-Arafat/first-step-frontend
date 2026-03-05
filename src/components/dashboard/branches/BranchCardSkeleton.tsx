import { Skeleton } from "@/components/ui/skeleton";

const BranchCardSkeleton = () => {
  return (
    <div className="bg-sidebar border border-gray-100 p-6 flex flex-col lg:flex-row gap-8 rounded-2xl">
      <div className="flex flex-col gap-y-6 w-full">
        <div className="flex items-start gap-4">
          <Skeleton className="w-[81.66px] h-[80px] rounded-full" />

          <div className="flex flex-col gap-2 lg:gap-4 w-full">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        <div className="flex gap-5 lg:gap-x-10">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="flex flex-col gap-y-4 w-full">
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <div className="flex flex-col gap-y-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>

        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <div className="flex flex-col gap-y-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchCardSkeleton;
