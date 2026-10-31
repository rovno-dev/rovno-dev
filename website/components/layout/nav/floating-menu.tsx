"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, X } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const { t } = useLanguage();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent SSR hydration issues with Portals
  useEffect(() => {
    setMounted(true);
  }, []);

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

      {mounted && open && createPortal(
        <div
          id="floating-menu-panel"
          ref={dropdownRef}
          className={cn(
            "z-[9999] flex flex-col border border-[color-mix(in_srgb,var(--outline),transparent_50%)] shadow-2xl backdrop-blur-2xl bg-[color-mix(in_srgb,var(--card),transparent_15%)]",
            position === "bottom"
              ? "fixed inset-x-4 bottom-24 mx-auto max-w-sm rounded-[2rem] p-5"
              : "fixed top-[80px] right-4 w-64 rounded-3xl p-3"
          )}
        >
          <nav className="flex flex-col gap-1">
            {links.map((link, i) => {
              const isActive = pathname === link.href;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-2xl text-lg font-medium transition-colors",
                      isActive
                        ? "bg-(--primary-glass) text-(--primary)"
                        : "text-(--on-bg-high) hover:bg-(--state-hover)"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {position === "bottom" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="flex flex-col gap-4 pt-5 border-t border-[color-mix(in_srgb,var(--outline),transparent_50%)] mt-4"
            >
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm font-medium text-(--on-bg-medium)">
                  {t("nav.language")}
                </span>
                <LanguageSwitcher />
              </div>
              
              <Button 
                size="large" 
                className="w-full rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  requestAnimationFrame(() => {
                    setIsOrderOpen(true);
                  });
                }}
              >
                <TelemostStackIcon />
                {t("nav.order")}
              </Button>
            </motion.div>
          )}
        </div>,
        document.body
      )}

      <QuickOrderDialog
        serviceName="Консультация"
        open={isOrderOpen}
        onOpenChange={setIsOrderOpen}
      />
    </div>
  );
}
