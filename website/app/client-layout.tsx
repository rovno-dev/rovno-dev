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
  // — the home hero, every project case study, and every event landing
  // (the Nash.Dev terminal opens at the top of the viewport, its first
  // line painted behind the header bar).
  //
  // Detail pages match on `/projects/<slug>` and `/events/<slug>`:
  // split('/').filter(Boolean) → ["projects", "<slug>"] → length 2.
  // The list pages `/projects` and `/events` are length 1 and keep the
  // offset.
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const isDetailRoute = segments.length === 2;
  const isFullscreenTop =
    pathname === "/" ||
    (isDetailRoute &&
      (segments[0] === "projects" || segments[0] === "events"));

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
