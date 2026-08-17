import type { Metadata } from "next";
import { CheckUser } from "@/entities/user/model/check-user";
import ProfileRootClientLayout from "./client-layout";

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
      <ProfileRootClientLayout params={params} >
        {children}
      </ProfileRootClientLayout>
    </CheckUser>
  )
}
