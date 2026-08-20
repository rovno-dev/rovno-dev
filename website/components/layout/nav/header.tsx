"use client";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { Paintbrush, User } from "lucide-react";
import { ROUTES } from "@/utils/constants/routes";
import { useUser } from "@/entities/user/model/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, isLoading, logout } = useUser();
  const { secret: adminSecret, loading: adminSecretLoading } = useAdminSecret();
  const pathname = usePathname();

  // Check if current route is admin or app/profile
  const isFullWidth = pathname?.startsWith('/admin') || pathname?.startsWith('/app/profile');

  return (
    <header
      className="h-[55px] md:h-[70px]
      fixed top-0 left-0 right-0 w-full z-50
      flex items-center
      bg-(--card-glass) backdrop-blur-glass border-b border-b-(--card-glass)"
    >
      <Container
        variant={isFullWidth ? 'full-width' : 'default'}
        className="flex justify-center sm:justify-between"
      >
        <div className="flex items-center justify-between gap-8">
          <Link href={'/'}>
            <Logo className="!h-[30px] sm:h-[40px]" />
          </Link>
          <nav className="hidden md:flex gap-4 text-sm">
            <NavLink href={ROUTES.projects.href}>Проекты</NavLink>
            <NavLink href={ROUTES.about.href}>О нас</NavLink>
            <NavLink href={ROUTES.blog.href}>{'Журнал "Ровня"'}</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button size={'small'} className="hidden sm:flex" asChild>
            <Link href={ROUTES.order.href}>
              <Paintbrush />
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
                  <Button variant="glass" size="icon-small" className="ml-2">
                    <User />
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
