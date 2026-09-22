import type { Metadata } from "next";
import { CheckUser } from "@/entities/user/model/check-user";
import AdminRootClientLayout from "./client-layout";
export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin panel",
};
// LLM context: this layout matches /admin/*. The [secret] segment is BELOW
// this layout, so LayoutProps<"/admin">.params is Promise<{}> — declaring
// Promise<{ secret: string }> here is a type error. The secret reaches the
// sidebar via useAdminSecret() (fetched from /api/admin-secret), not params.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CheckUser>
      <AdminRootClientLayout>{children}</AdminRootClientLayout>
    </CheckUser>
  );
}
