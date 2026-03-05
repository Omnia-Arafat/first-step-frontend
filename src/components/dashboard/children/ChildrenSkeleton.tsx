import { Skeleton } from "@/components/ui/skeleton";

const ChildrenSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-sidebar border border-gray-100 rounded-2xl p-6 flex flex-col lg:flex-row gap-8"
        >
          <div className="flex flex-col gap-y-6">
            <div className="flex items-start gap-4">
              <div className="w-[91.32px] h-[120px] rounded-lg border border-gray-100 p-1">
                <Skeleton className="w-full h-full rounded-md" />
              </div>
              <div className="flex flex-col gap-2 lg:gap-4">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-9 w-36 rounded-md" />
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div>
              <Skeleton className="h-6 w-36 mb-1" />
              <div className="flex flex-col gap-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-28 mb-1" />
              <div className="flex flex-col gap-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-40 mb-1" />
              <div className="flex flex-col gap-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChildrenSkeleton;
