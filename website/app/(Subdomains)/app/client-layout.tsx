"use client"
import { ProfileSidebar } from "./_components/profile-sidebar";
import { Container } from "@/components/ui/container";

export default function ProfileRootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--bg) py-12 md:py-16">
      <Container>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Width is owned by <Sidebar />, not this wrapper, so collapse
              animation doesn't fight an outer max-width. */}
          <aside className="w-full md:w-auto shrink-0">
            <ProfileSidebar />
          </aside>
          {/* Nested <main> inside the root layout's <main> is invalid HTML
              and causes inconsistent overflow in Chromium. Use a plain div
              with role="main" instead. */}
          <div role="main" className="flex-1 flex justify-center min-w-0">
            <div className="w-full max-w-5xl space-y-8 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
