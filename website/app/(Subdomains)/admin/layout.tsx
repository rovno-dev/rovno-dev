import type { Metadata } from "next";
import { AdminSidebar } from "./_components/admin-sidebar";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { CheckUser } from "@/entities/user/model/check-user";

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
  const [secret, setSecret] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSecret(p.secret));
  }, [params]);
  return <>
    <CheckUser>
      <div className="min-h-screen bg-(--bg) py-12 md:py-16">
        <Container>
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-64 shrink-0">
              <AdminSidebar secret={secret} />
            </div>
            <main className="flex-1 space-y-8">
              {children}
            </main>
          </div >
        </Container >
      </div >
    </CheckUser >
  </>;
}
