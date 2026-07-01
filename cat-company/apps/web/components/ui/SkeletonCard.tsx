import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
    </div>
  );
}