"use client"

import { AdminSidebar } from "./_components/admin-sidebar";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { CheckUser } from "@/entities/user/model/check-user";

export default function AdminRootClientLayout({
  children, params
}: {
  children: React.ReactNode;
  params: Promise<{ secret: string }>
}) {
  const [secret, setSecret] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSecret(p.secret));
  }, [params]);

  return (
    <div className="min-h-screen bg-(--bg) py-12 md:py-16">
      <Container>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <aside className="w-full md:w-64 shrink-0">
            <AdminSidebar secret={secret} />
          </aside>
          <main className="flex-1 space-y-8">
            {children}
          </main>
        </div >
      </Container >
    </div >
  )
}
