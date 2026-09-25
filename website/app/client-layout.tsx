"use client"
import "./globals.css";
import BottomAppBar from "@/components/layout/nav/bottom-app-bar";
import Footer from "@/components/layout/nav/footer";
import Header from "@/components/layout/nav/header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { lang } = useLanguage();

  // Pages whose topmost section is designed to sit behind the fixed header
  // — the home hero and every project case study. Every other page needs
  // the mt offset so its content clears the header.
  //
  // `/projects/<slug>` matches: split('/') → ["", "projects", "<slug>"]
  // → length 3. `/projects` itself is length 2 and keeps the offset.
  const isFullscreenTop =
    pathname === "/" ||
    (pathname?.startsWith("/projects/") &&
      pathname.split("/").filter(Boolean).length === 2);

  return (
    <>
      <Header />
      <div className="relative" key={lang}>
        <main
          className={cn(
            isFullscreenTop ? "mt-0" : "mt-[46px] md:mt-[88px]",
            "mb-0 overflow-x-clip",
          )}
        >
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
      </div>
    </>
  );
}
