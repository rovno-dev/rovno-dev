"use client";
import Link from "next/link";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { User } from "@phosphor-icons/react";
import { ROUTES } from "@/utils/constants/routes";
import { useUser } from "@/entities/user/model/user-context";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useRootHref } from "@/hooks/use-root-href";
import { crossSubdomainUrl, rootDomainUrl } from "@/utils/root-domain";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { FloatingMenu } from "./floating-menu";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { TelemostStackIcon } from "@/components/icons/telemost-stack-icon";
import { Container } from "@/components/ui/container";

export default function Header() {
  const { user, isLoading, logout } = useUser();
  const { t } = useLanguage();
  const logoHref = useRootHref();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { secret: adminSecret } = useAdminSecret(user?.id ?? null);
  const adminHref = adminSecret
    ? crossSubdomainUrl("admin", `/${adminSecret}`)
    : null;
  const profileHref = crossSubdomainUrl("app", "/profile");
  const rootLink = (path: string) => rootDomainUrl(path);

  // Scroll shadow lives here instead of inside the class so `.bg-card `
  // stays static. Inline style wins over the utility's box-shadow, which
  // is what we want — the base shadow is the resting state.
  const dockShadow = isScrolled
    ? { boxShadow: "0 6px 28px -4px rgba(0, 0, 0, 0.14)" }
    : undefined;

  const navLinkClass =
    "inline-flex items-center h-8 px-2.5 text-[13px] leading-none whitespace-nowrap transition-colors";
  const navActiveClass = "text-(--on-bg-high) font-medium";
  const navInactiveClass = "text-(--on-bg-medium) hover:text-(--on-bg-high)";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pt-3">
      <Container className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] items-center justify-center gap-2">
        <div className="hidden sm:block"></div>
        <div
          className="bg-card mx-auto flex items-center h-12 w-fit pl-4 pr-3 rounded-3xl gap-2"
          style={dockShadow}
        >
          <Link
            href={logoHref}
          >
            <Logo className="!h-5" />
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
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="text"
                  size="icon-small"
                  shape="round"
                  className="size-8 rounded-3xl hover:bg-(--state-hover)"
                >
                  <User className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={profileHref} prefetch={false}>
                        {t("nav.profile")}
                      </Link>
                    </DropdownMenuItem>
                    {(user?.role === "admin" || user?.role === "root") &&
                      adminHref && (
                        <DropdownMenuItem asChild>
                          <Link href={adminHref}>{t("nav.admin")}</Link>
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuItem onClick={logout}>
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={rootLink("/login")}>{t("nav.login")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={rootLink("/register")}>{t("nav.register")}</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div
            className="hidden sm:flex lg:hidden"
          >
            <FloatingMenu
              position="top"
            />
          </div>
        </div>
        <div className="hidden sm:block">
          <QuickOrderDialog serviceName="Консультация">
            <Button
              size="small"
              shape="square"
              variant={'tonal-card'}
              className="h-12! w-fit ml-auto"
              style={dockShadow}
            >
              <TelemostStackIcon className="mr-1 -ml-1" />
              {t("nav.order")}
            </Button>
          </QuickOrderDialog>
        </div>
      </Container>
    </header>
  );
}
