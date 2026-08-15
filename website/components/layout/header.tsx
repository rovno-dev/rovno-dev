"use client";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import RovnoLogotype from "./rovno-dev-logotype/rovno-dev-logotype";
import { Button } from "../ui/button";
import { NavLink } from "./nav-link";
import { DesignServicesIcon, UserIcon } from "../icons";
import { ROUTES } from "@/utils/constants/routes";
import { useUser } from "@/entities/user/model/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isLoading, logout } = useUser();
  const router = useRouter();

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;

  return (
    <header
      className="h-[55px] md:h-[70px] 
      fixed top-0 left-0 right-0 w-full z-50 
      flex items-center
      bg-(--card-glass) backdrop-blur-glass border-b border-b-(--card-glass)"
    >
      <Container
        className="flex justify-center sm:justify-between"
      >
        <div className="flex items-center gap-8">
          <Link href={'/'}>
            <RovnoLogotype className="!h-[30px] sm:h-[40px]" />
          </Link>
          <nav className="hidden md:flex gap-4 text-sm">
            <NavLink href={ROUTES.projects.href}>Проекты</NavLink>
            <NavLink href={ROUTES.about.href}>О нас</NavLink>
            <NavLink href={ROUTES.journal.href}>{'Журнал "Ровня"'}</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button size={'small'} className="hidden sm:flex" asChild>
            <Link href={ROUTES.order.href}>
              <DesignServicesIcon />
              Оформить заказ
            </Link>
          </Button>
          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="glass" size="icon-small" className="ml-2">
                      <UserIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/app/profile">Профиль</Link>
                    </DropdownMenuItem>
                    {(user.role === 'admin' || user.role === 'root') && adminSecret && (
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/${adminSecret}`}>Админ-панель</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout}>Выйти</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Login button (commented out for now)
                // <Button variant="text" asChild><Link href="/login">Войти</Link></Button>
                null
              )}
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
