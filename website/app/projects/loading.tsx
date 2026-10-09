import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Route-level fallback for /projects. Fires while the RSC awaits the DB
 * fetch on a cold navigation.
 *
 * Structured to match the final layout 1:1 — heading at the same vertical
 * offset, filter pill at the same sticky position with the same height,
 * and a grid of 16:9 card shells — so the skeleton-to-content swap does
 * not shift anything on the page.
 */
export default function ProjectsLoading() {
  return (
    <main className="min-h-screen bg-(--bg)">
      <Container>
        <div className="pt-6 md:pt-8">
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
      </Container>

      {/* Sticky filter pill */}
      <div className="sticky top-[68px] md:top-[92px] z-40 mt-4 mb-5">
        <Container>
          <div
            className={cn(
              "flex items-center gap-1 h-12 md:h-[56px] rounded-full",
              "border border-(--outline) bg-(--bg)/80 backdrop-blur-glass",
              "shadow-[0_1px_2px_rgba(0,0,0,0.04)] pl-4 pr-1.5",
            )}
          >
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-[140px] rounded-md ml-2" />
            <div className="hidden md:flex flex-1 items-center gap-1.5 pl-3 ml-2 border-l border-(--outline) h-8 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-7 w-20 rounded-full shrink-0"
                />
              ))}
            </div>
          </div>
        </Container>
      </div>

      <section className="pb-24 md:pb-32">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="relative overflow-hidden rounded-2xl border border-(--outline) bg-(--card) ring-0"
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
        </Container>
      </section>
    </main>
  );
}
