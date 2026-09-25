import { Container } from "@/components/ui/container";
import { ProjectGridSkeleton } from "./[slug]/_components/project-grid-skeleton";

/**
 * Route-level fallback. Fires when the user navigates to /projects and the
 * RSC has not yet streamed its first byte — so a slow backend shows the
 * skeleton rather than a blank page.
 */
export default function ProjectsLoading() {
  return (
    <main className="min-h-screen bg-(--bg)">
      <section className="pt-20 md:pt-28 pb-8">
        <Container>
          <div className="h-3 w-24 rounded-full bg-(--bg-disabled) mb-5 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
          </div>
          <div className="h-16 w-2/3 max-w-[500px] rounded-2xl bg-(--bg-disabled) mb-6 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
          </div>
          <div className="h-5 w-1/2 max-w-[400px] rounded-full bg-(--bg-disabled) relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
          </div>
        </Container>
      </section>
      <section className="py-8">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-full bg-(--bg-disabled) relative overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
              </div>
            ))}
          </div>
          <ProjectGridSkeleton count={6} />
        </Container>
      </section>
    </main>
  );
}
