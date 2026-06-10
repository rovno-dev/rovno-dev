import { Container } from "@/components/ui/container";
import Link from "next/link";
import RovnoLogotype from "./rovno-dev-logotype/rovno-dev-logotype";
import { Button } from "../ui/button";
import { NavLink } from "./nav-link";
import { DesignServicesIcon } from "../icons";
import { ROUTES } from "@/utils/constants/routes";

export default function Header() {
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
            {/* <NavLink href={ROUTES.job}>Вакансии</NavLink> */}
            <NavLink href={ROUTES.journal.href}>{'Журнал "Ровня"'}</NavLink>
            {/* <NavLink href={ROUTES.blog.href}>Блог</NavLink> */}
          </nav>
        </div>

        <Button className="hidden sm:flex" asChild>
          <Link href={"https://forms.yandex.com/cloud/6936a4b1d0468820623c548e"}>
            <DesignServicesIcon />
            Оформить заказ
          </Link>
        </Button>
      </Container>
    </header >
  );
}
