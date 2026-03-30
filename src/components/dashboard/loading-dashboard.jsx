import { Skeleton } from "../ui/skeleton";

export function LoadingDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[28px]" />
        ))}
      </div>
      <Skeleton className="h-[380px] rounded-[32px]" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-[420px] rounded-[32px]" />
        <Skeleton className="h-[420px] rounded-[32px]" />
      </div>
    </div>
  );
}
