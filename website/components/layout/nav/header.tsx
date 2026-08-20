"use client";

import { Container } from "@/components/ui/container";
import Link from "next/link";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { Lightbulb, User } from "lucide-react";
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
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, isLoading, logout } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { secret: adminSecret, loading: adminSecretLoading } = useAdminSecret();
  const pathname = usePathname();

  // Check if current route is admin or app/profile
  const isFullWidth = pathname?.startsWith('/admin') || pathname?.startsWith('/app/profile');

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 justify-center w-full flex items-center mx-auto transition-width duration-400 ease-in-out",
        isScrolled ? "max-w-[900px]" : "max-w-full"
      )}
    >
      <Container
        variant={isFullWidth ? 'full-width' : 'default'}
        className="flex justify-center gap-6 sm:justify-between
        bg-[var(--bg)]/40 backdrop-blur-glass border-b border-b-(--card-glass)
        rounded-full mx-4 sm:px-6 sm:mx-0 mt-2 h-[55px] sm:h-[80px] px-6
        "
      >
        <div className={cn((isLoading || user) ? "justify-between" : "justify-center", "w-full flex items-center gap-6")}>
          <Link href={'/'}>
            <Logo className="!h-[30px] sm:h-[40px]" />
          </Link>
          <nav className="hidden md:flex gap-4 text-sm">
            <NavLink href={ROUTES.projects.href}>Проекты</NavLink>
            <NavLink href={ROUTES.about.href}>О нас</NavLink>
            <NavLink href={ROUTES.blog.href}>{'Журнал "Ровня"'}</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Button size={'small'} className="hidden sm:flex" asChild>
            <Link href={ROUTES.order.href}>
              <Lightbulb />
              Оформить заказ
            </Link>
          </Button>
          {isLoading ? (
            <div className="ml-2 flex items-center">
              <Skeleton className="size-8 rounded-full" />
            </div>
          ) : (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="text" size="icon-small" className="ml-2">
                    <User className="stroke-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/app/profile">Профиль</Link>
                  </DropdownMenuItem>
                  {(user?.role === 'admin' || user?.role === 'root') && (
                    <>
                      {adminSecret ? (
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/${adminSecret}`}>Админ-панель</Link>
                        </DropdownMenuItem>
                      ) : (
                        ""
                      )}
                    </>
                  )}
                  <DropdownMenuItem onClick={logout}>Выйти</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null
          )}
        </div>
      </Container>
    </header>
  );
}
