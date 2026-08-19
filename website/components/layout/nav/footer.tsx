"use client"

import { ROUTES } from "@/utils/constants/routes";
import { DprofileLogotypeMonoIcon, PinterestLogotypeMonoIcon, TelegramLogotypeMonoIcon, VKLogotypeMonoIcon } from "@/components/icons";
import { Button } from "../../ui/button";
import { Container } from "../../ui/container";
import RovnoLogotypeWordmark from "../logo/logo-wordmark";
import { NavLink } from "./nav-link";
import { ThemeSwitcher } from "../theme-switcher";
import Link from "next/link";
import { GithubLogotypeMonoIcon } from "../../icons/logotypes/github-logo-mono-icon";
import { usePathname } from "next/navigation";

export default function Footer() {
  const sections = [
    {
      title: "Агентство",
      links: [
        { title: "Проекты", href: ROUTES.projects.href },
        { title: "О нас", href: ROUTES.about.href },
        { title: "Карьера в Rovno.dev", href: "https://forms.yandex.com/u/69975d0849af47b15b4c80df" },
      ],
    },
    {
      title: "Услуги",
      links: [
        { title: "Веб-разработка", href: ROUTES.order.href },
        { title: "UX/UI Дизайн", href: ROUTES.order.href },
        { title: "Айдентика", href: ROUTES.order.href },
        { title: "3D & Motion", href: ROUTES.order.href },
        { title: "Другое", href: ROUTES.order.href },
      ],
    },
    {
      title: "Медиа",
      links: [
        { title: "Журнал «Ровня»", href: ROUTES.blog.href },
        { title: "Предложить статью", href: "https://t.me/rovno_dev?direct" },
        // { title: "База знаний", href: "" },
      ],
    },
  ];
  const pathname = usePathname();
  const isFullWidth = pathname?.startsWith('/admin') || pathname?.startsWith('/app/profile');

  return (
    <footer className="bg-(--bg) pt-20 pb-32 border-t border-(--outline)">
      <Container variant={isFullWidth ? 'full-width' : 'default'}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-24 mb-20">
          {/* Brand Column */}
          <div className="flex flex-col gap-6 max-w-sm">
            <Link href="/" className="w-fit">
              <RovnoLogotypeWordmark className="h-8! w-auto" />
            </Link>
            <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
              Проектируем и разрабатываем ровные, высоконагруженные цифровые продукты для решения сложных задач
            </p>
            <div className="flex items-center gap-1 mt-2">
              <SocialButton href="https://t.me/rovno_dev" icon={<TelegramLogotypeMonoIcon />} />
              <SocialButton href="https://vk.com/rovno_dev" icon={<VKLogotypeMonoIcon />} />
              <SocialButton href="https://github.com/rovno-dev" icon={<GithubLogotypeMonoIcon />} />
              <SocialButton href="https://dprofile.ru/rovno_dev" icon={<DprofileLogotypeMonoIcon />} />
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 sm:gap-16">
            {sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h4 className="text-body-4 font-bold uppercase tracking-widest text-(--on-bg-low)">
                  {section.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <NavLink
                        href={link.href}
                        className="text-body-3 text-(--on-bg-medium) hover:text-(--primary) transition-colors p-0 bg-transparent!"
                      >
                        {link.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-8 border-t border-(--outline)">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="text-body-5 text-(--on-bg-low)">
              © 2023–{new Date().getFullYear()} Цифровое агентство полного цикла Rovno.dev, все права защищены
            </span>
            {/* <Link href="i.rovno.dev/docs/pd-policy" className="text-body-5 text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors">
              Политика конфиденциальности
            </Link> */}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function SocialButton({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Button variant="text" size="icon-small" asChild className="hover:bg-(--primary-glass)! group">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
    </Button>
  );
}
