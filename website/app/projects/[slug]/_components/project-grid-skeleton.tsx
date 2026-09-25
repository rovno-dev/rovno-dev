import { Card } from "@/components/ui/card";

/**
 * Skeleton for the /projects grid. Matches the tile geometry of
 * <ProjectCard> exactly — same aspect ratio, same radius, same padding —
 * so the layout doesn't shift when real data arrives.
 */
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card) ring-0"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-(--bg-disabled)">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
          </div>
          <div className="p-5 md:p-6 space-y-3">
            <div className="h-4 w-2/3 rounded-md bg-(--bg-disabled) relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
            </div>
            <div className="h-3 w-1/3 rounded-md bg-(--bg-disabled) relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
