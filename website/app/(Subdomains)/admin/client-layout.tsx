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
        {/*
          Two-column layout that owns its own scroll height.

          - `items-start` keeps the sidebar from stretching to match the
            content column, which is what a long form (project editor) would
            otherwise force.
          - `md:sticky md:top-24` pins the sidebar below the fixed header
            while the content scrolls under it.
          - The right column has no overflow settings — the whole page
            scrolls naturally, which is the simplest, most reliable pattern
            for admin pages of any length.
        */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-auto md:sticky md:top-24 md:self-start shrink-0">
            <AdminSidebar />
          </div>
          <div role="main" className="w-full min-w-0 pb-24">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
