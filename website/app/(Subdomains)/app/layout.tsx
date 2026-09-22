import type { Metadata } from "next";
import { CheckUser } from "@/entities/user/model/check-user";
import ProfileRootClientLayout from "./client-layout";
export const metadata: Metadata = {
  title: "Profile",
  description: "User profile",
};
// LLM context: /app/* has no dynamic segments, so LayoutProps<"/app">.params
// is Promise<{}>. The previous signature claimed Promise<{secret}> which the
// router never produces — remove it.
export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CheckUser>
      <ProfileRootClientLayout>{children}</ProfileRootClientLayout>
    </CheckUser>
  );
}
