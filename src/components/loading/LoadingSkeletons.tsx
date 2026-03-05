import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ListItemSkeleton({
  className,
  lines = 2,
  showLeading = true,
}: {
  className?: string;
  lines?: number;
  showLeading?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border/60 p-3 flex items-center gap-4",
        className
      )}
    >
      {showLeading && <Skeleton className="h-10 w-10 rounded-lg shrink-0" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40 max-w-[60%]" />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-3", index === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({
  count = 4,
  itemClassName,
}: {
  count?: number;
  itemClassName?: string;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <ListItemSkeleton key={index} className={itemClassName} />
      ))}
    </div>
  );
}

export function SelectFieldSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function SelectOptionsSkeleton({
  count = 5,
}: {
  count?: number;
}) {
  return (
    <div className="p-2">
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-sm px-2 py-2"
          >
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormOptionsSkeleton({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}
