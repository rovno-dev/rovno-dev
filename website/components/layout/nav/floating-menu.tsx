"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, X, Lightbulb } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { useLanguage } from "@/providers/language-provider";
import { rootDomainUrl } from "@/utils/root-domain";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "../language-switcher";

interface FloatingMenuProps {
  position?: "top" | "bottom";
  triggerClassName?: string;
  triggerSize?: React.ComponentProps<typeof Button>["size"];
  triggerShape?: React.ComponentProps<typeof Button>["shape"];
  triggerIconClassName?: string;
}

export function FloatingMenu({
  position = "bottom",
  triggerClassName,
  triggerSize = "icon-small",
  triggerShape = "square",
  triggerIconClassName,
}: FloatingMenuProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = wrapperRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const rootLink = (path: string) => rootDomainUrl(path);
  const links = [
    { href: rootLink(ROUTES.projects.href), label: t("nav.projects") },
    { href: rootLink(ROUTES.services.href), label: t("nav.services") },
    { href: rootLink(ROUTES.events.href), label: t("nav.events") },
    { href: rootLink(ROUTES.about.href), label: t("nav.about") },
    { href: rootLink(ROUTES.blog.href), label: t("nav.blog") },
  ];

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <Button
        variant="text"
        shape={triggerShape}
        size={triggerSize}
        className={triggerClassName}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="floating-menu-panel"
        aria-label={t("nav.menu")}
      >
        {open ? (
          <X className={triggerIconClassName} />
        ) : (
          <ListIcon className={triggerIconClassName} />
        )}
      </Button>
      
      {open && (
        <div
          id="floating-menu-panel"
          className={cn(
            "z-[60] flex flex-col border border-(--outline) shadow-2xl backdrop-blur-2xl bg-(--card)/80",
            position === "bottom"
              ? "fixed inset-x-4 bottom-24 mx-auto max-w-sm rounded-[2rem] p-5 animate-in slide-in-from-bottom-6 fade-in duration-300"
              : "absolute top-[calc(100%+16px)] right-0 w-64 rounded-3xl p-3 animate-in slide-in-from-top-4 fade-in duration-200"
          )}
        >
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-lg font-medium transition-colors",
                    isActive
                      ? "bg-(--primary-glass) text-(--primary)"
                      : "text-(--on-bg-high) hover:bg-(--state-hover)",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          {/* Mobile-only bottom section */}
          {position === "bottom" && (
            <div className="flex flex-col gap-4 pt-5 border-t border-(--outline) mt-4">
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm font-medium text-(--on-bg-medium)">
                  {t("nav.language")}
                </span>
                <LanguageSwitcher />
              </div>

              <Button size="large" className="w-full rounded-xl" asChild>
                <Link href={rootLink(ROUTES.order.href)} onClick={() => setOpen(false)}>
                  <Lightbulb weight="fill" className="size-5" />
                  {t("nav.order")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
