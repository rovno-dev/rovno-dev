"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { User, CaretLeftIcon } from "@phosphor-icons/react";
import { ROUTES } from "@/utils/constants/routes";
import { useUser } from "@/entities/user/model/user-context";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useRootHref } from "@/hooks/use-root-href";
import { crossSubdomainUrl, rootDomainUrl } from "@/utils/root-domain";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { FloatingMenu } from "./floating-menu";
import { CycleText } from "./cycle-text";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { TelemostStackIcon } from "@/components/icons/telemost-stack-icon";
import { Container } from "@/components/ui/container";

/**
 * Parent route for a detail page, or null when the current route is not
 * a detail page. Drives the back affordance in the header's left slot.
 *
 * The map is explicit rather than derived from `segments[0]` alone, so a
 * renamed section cannot silently start linking somewhere wrong, and so
 * the label is the section's own human name instead of a URL fragment.
 */
function useBackTarget() {
  const pathname = usePathname() || "";
  const { t } = useLanguage();

  return useMemo(() => {
    const segs = pathname.split("/").filter(Boolean);
    if (segs.length < 2) return null;
    const map: Record<string, { href: string; label: string }> = {
      projects: { href: "/projects", label: t("nav.projects") },
      blog: { href: "/blog", label: t("nav.blog") },
      events: { href: "/events", label: t("nav.events") },
      services: { href: "/#services", label: t("nav.services") },
      companies: { href: "/companies", label: t("nav.companies") },
      tech: { href: "/tech", label: "Технологии" },
      docs: { href: "/docs", label: "Документы" },
    };
    return map[segs[0]] ?? null;
  }, [pathname, t]);
}

export default function Header() {
  const { user, isLoading, logout } = useUser();
  const { t } = useLanguage();
  const logoHref = useRootHref();
  const back = useBackTarget();

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

  const { secret: adminSecret } = useAdminSecret(user?.id ?? null);
  const adminHref = adminSecret
    ? crossSubdomainUrl("admin", `/${adminSecret}`)
    : null;
  const profileHref = crossSubdomainUrl("app", "/profile");
  const rootLink = (path: string) => rootDomainUrl(path);

  const dockShadow = isScrolled
    ? { boxShadow: "0 6px 28px -4px rgba(0, 0, 0, 0.14)" }
    : undefined;

  const navLinkClass =
    "inline-flex items-center h-8 px-2.5 text-[13px] leading-none whitespace-nowrap transition-colors";
  const navActiveClass = "text-(--on-bg-high) font-medium";
  const navInactiveClass = "text-(--on-bg-medium) hover:text-(--on-bg-high)";

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full px-3 pt-3 pointer-events-none">
      <div className="mx-auto max-w-7xl w-full pointer-events-auto">
        <Container className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] items-center justify-center gap-2">        {/* Left slot. Empty on the root of any section; a native-app-style
            back chip on a detail page. This is the space the old layout
            simply wasted. */}
          <div className="hidden sm:flex min-w-0 items-center">
            <AnimatePresence initial={false}>
              {back && (
                <motion.div
                  key={back.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Button
                    variant="tonal-card"
                    size="small"
                    shape="square"
                    asChild
                    className="h-12! gap-1.5 pl-3 pr-4"
                    style={dockShadow}
                  >
                    <Link href={back.href}>
                      <CaretLeftIcon className="size-4" weight="bold" />
                      <span className="text-[13px] font-medium truncate max-w-[120px]">
                        {back.label}
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Centre dock */}
          <div
            className="bg-card mx-auto flex items-center h-12 w-fit pl-4 pr-3 rounded-3xl gap-2"
            style={dockShadow}
          >
            <Link href={logoHref} className="inline-flex items-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.82, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.12,
                }}
                className="inline-flex items-center"
              >
                <Logo className="!h-5" />
              </motion.span>
            </Link>
            <nav className="hidden lg:flex items-center h-8">
              <NavLink
                href={rootLink(ROUTES.projects.href)}
                className={navLinkClass}
                activeClassName={navActiveClass}
                inactiveClassName={navInactiveClass}
              >
                {t("nav.projects")}
              </NavLink>
              <NavLink
                href={rootLink(ROUTES.services.href)}
                className={navLinkClass}
                activeClassName={navActiveClass}
                inactiveClassName={navInactiveClass}
              >
                {t("nav.services")}
              </NavLink>
              <NavLink
                href={rootLink(ROUTES.events.href)}
                className={navLinkClass}
                activeClassName={navActiveClass}
                inactiveClassName={navInactiveClass}
              >
                {t("nav.events")}
              </NavLink>
              <NavLink
                href={rootLink(ROUTES.about.href)}
                className={navLinkClass}
                activeClassName={navActiveClass}
                inactiveClassName={navInactiveClass}
              >
                {t("nav.about")}
              </NavLink>
              <NavLink
                href={rootLink(ROUTES.blog.href)}
                className={navLinkClass}
                activeClassName={navActiveClass}
                inactiveClassName={navInactiveClass}
              >
                {t("nav.blog")}
              </NavLink>
            </nav>
            {isLoading ? (
              <Skeleton className="size-8 rounded-3xl" />
            ) : (
              <div className="relative" ref={profileRef}>
                <Button
                  variant="text"
                  size="icon-small"
                  shape="round"
                  className="size-8 rounded-3xl hover:bg-(--state-hover)"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <User className="size-4" />
                </Button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-4 w-64 rounded-3xl border border-[color-mix(in_srgb,var(--outline),transparent_50%)] shadow-2xl backdrop-blur-2xl bg-[color-mix(in_srgb,var(--card),transparent_15%)] p-3 flex flex-col gap-1 z-[9999]"
                    >
                      <div className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 bg-[color-mix(in_srgb,var(--card),transparent_15%)] border-t border-l border-[color-mix(in_srgb,var(--outline),transparent_50%)]" />
                      {user ? (
                        <>
                          <Link
                            href={profileHref}
                            prefetch={false}
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-3 rounded-2xl text-base font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                          >
                            {t("nav.profile")}
                          </Link>
                          {(user?.role === "admin" || user?.role === "root") &&
                            adminHref && (
                              <Link
                                href={adminHref}
                                onClick={() => setProfileOpen(false)}
                                className="block px-4 py-3 rounded-2xl text-base font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                              >
                                {t("nav.admin")}
                              </Link>
                            )}
                          <button
                            onClick={() => {
                              logout();
                              setProfileOpen(false);
                            }}
                            className="block w-full px-4 py-3 rounded-2xl text-base font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                          >
                            {t("nav.logout")}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={rootLink("/login")}
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-3 rounded-2xl text-base font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                          >
                            {t("nav.login")}
                          </Link>
                          <Link
                            href={rootLink("/register")}
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-3 rounded-2xl text-base font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                          >
                            {t("nav.register")}
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <div className="hidden sm:flex lg:hidden">
              <FloatingMenu position="top" />
            </div>
          </div>

          {/* Right slot - order CTA. `justify-center` on the button plus the
            `leading` slot inside CycleText keeps icon and label centred as
            one unit inside the width reserved for the longest label. */}
          <div className="hidden sm:flex min-w-0 justify-end">
            <QuickOrderDialog serviceName="Консультация">
              <Button
                size="small"
                shape="square"
                variant="tonal-card"
                className="h-12! w-fit justify-center gap-1.5"
              >
                <TelemostStackIcon className="-ml-0.5" />
                <CycleText
                  labels={[
                    t("nav.order_cycle_1"),
                    t("nav.order_cycle_2"),
                    t("nav.order_cycle_3"),
                  ]}
                />
              </Button>
            </QuickOrderDialog>
          </div>
        </Container>
      </div>
    </header>
  );
}
