"use client"

import "./globals.css";
import BottomAppBar from "@/components/layout/nav/bottom-app-bar";
import Footer from "@/components/layout/nav/footer";
import Header from "@/components/layout/nav/header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <main className={cn(pathname == '/' ? "mt-0" : "mt-[46px] md:mt-[88px]", "mb-[100px]")}>
        {children}
      </main>
      <Footer />
      <BottomAppBar />
      <Toaster
        position="bottom-right"
        closeButton
        gap={8}
        visibleToasts={3}
      />
    </>
  );
}
