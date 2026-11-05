"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { useLanguage } from "@/providers/language-provider";
import { rootDomainUrl } from "@/utils/root-domain";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "../language-switcher";
import { TelemostStackIcon } from "@/components/icons/telemost-stack-icon";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";

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
    const [isOrderOpen, setIsOrderOpen] = useState(false);
  const { t } = useLanguage();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Handle outside clicks
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = wrapperRef.current;
      const drop = dropdownRef.current;
      if (!el || !drop) return;

      if (el.contains(e.target as Node) || drop.contains(e.target as Node)) return;

      if (
        e.target instanceof HTMLElement &&
        (e.target.closest('[role="dialog"]') || e.target.closest('[data-radix-portal]'))
      ) {
        return;
      }

      setOpen(false);
    };

    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("touchstart", onDown);
    }, 10);

    return () => {
      clearTimeout(timeout);
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

      <AnimatePresence>
        {open && (
          <motion.div
            id="floating-menu-panel"
            ref={dropdownRef}
            initial={{ opacity: 0, y: position === "bottom" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "bottom" ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute z-[9999] flex flex-col border border-[color-mix(in_srgb,var(--outline),transparent_50%)] shadow-2xl backdrop-blur-2xl bg-[color-mix(in_srgb,var(--card),transparent_15%)] w-64 max-w-[calc(100vw-3rem)] rounded-3xl p-3",
              position === "bottom"
                ? "bottom-full right-0 mb-4"
                : "top-full right-0 mt-4"
            )}
          >
            {/* Arrow */}
            <div className={cn(
              "absolute right-3 w-3 h-3 rotate-45 bg-[color-mix(in_srgb,var(--card),transparent_15%)] border-t border-l border-[color-mix(in_srgb,var(--outline),transparent_50%)]",
              position === "bottom" ? "-bottom-1.5 border-b border-r border-t-0 border-l-0" : "-top-1.5"
            )} />

            <nav className="flex flex-col gap-1">
            {links.map((link, i) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-2xl text-base font-medium text-center transition-colors",
                    isActive
                      ? "bg-(--primary-glass) text-(--primary)"
                      : "text-(--on-bg-high) hover:bg-(--state-hover)"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
