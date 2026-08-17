import type { Metadata } from "next";
import { AdminSidebar } from "./_components/admin-sidebar";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { CheckUser } from "@/entities/user/model/check-user";
import AdminRootClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin panel",
};
export default function AdminRootLayout({
  children, params
}: {
  children: React.ReactNode;
  params: Promise<{ secret: string }>
}) {
  return (
    <CheckUser>
      <AdminRootClientLayout params={params} >
        {children}
      </AdminRootClientLayout>
    </CheckUser>
  )
}
