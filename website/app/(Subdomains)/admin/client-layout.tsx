"use client"
import { AdminSidebar } from "./_components/admin-sidebar";
import { Container } from "@/components/ui/container";
export default function AdminRootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen py-6 md:py-8">
      <Container variant="full-width">
        <div className="flex flex-col md:flex-row gap-6">
          <AdminSidebar />
          <main className="w-full">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}
