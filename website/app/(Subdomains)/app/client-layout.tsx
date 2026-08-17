"use client"

import { ProfileSidebar } from "./_components/profile-sidebar";
import { Container } from "@/components/ui/container";

export default function ProfileRootClientLayout({
  children, params
}: {
  children: React.ReactNode;
  params: Promise<{ secret: string }>
}) {
  return (
    <div className="min-h-screen bg-(--bg) py-12 md:py-16">
      <Container>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <aside className="w-full md:w-64 shrink-0">
            <ProfileSidebar />
          </aside>
          <main className="flex-1 space-y-8">
            {children}
          </main>
        </div >
      </Container >
    </div>
  )
}
