/* LLM context: Updating Footer social icons to support external links using Button asChild pattern */

import { ROUTES } from "@/utils/constants/routes";
import { DprofileLogotypeMonoIcon, PinterestLogotypeMonoIcon, TelegramLogotypeMonoIcon, VKLogotypeMonoIcon } from "../icons";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import RovnoLogotypeWordmark from "./rovno-dev-logotype/rovno-dev-logotype-wordmark";
import { NavLink } from "./nav-link";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";

export default function Footer() {
  const footerSections = [
    {
      id: 'main',
      title: (
        <div>
          <div className="flex mb-3 gap-2 items-center">
            <ThemeSwitcher />
            <RovnoLogotypeWordmark className="w-calc(100%-1rem)!" />
          </div>
          <SocialMediaIcons className="block lg:hidden!" />
        </div>
      ),
      links: [
        ROUTES.projects,
        ROUTES.about,
        ROUTES.journal,
        // ROUTES.job,
      ],
    },
    {
      id: 'journal',
      title: "Журнал Ровня",
      links: [
        // {
        //   title: 'Стать редактором',
        //   href: '/rovnya/become-editor',
        // },
        {
          title: 'Предложить статью',
          href: 'https://t.me/rovno_dev?direct',
        },
      ]
    },
    {
      title: "Студентам",
      links: [
        {
          title: 'Пройти стажировку',
          href: 'https://forms.yandex.com/u/69975d0849af47b15b4c80df',
        },
        {
          title: 'Повышение квалификации',
          href: 'https://forms.yandex.com/u/69975d0849af47b15b4c80df',
        },
      ],
    }
  ];

  return (
    <footer className="bg-card pb-[100px] pt-[30px] sm:pt-[50px] border-t border-t-outline">
      <Container className="sm:flex sm:gap-8">
        <div className="w-full grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 mt-4">
          {footerSections.map((section, index) => (
            <div key={index} className="w-full">
              {section.title && typeof section.title == 'string' ? <h3 className="text-(--on-bg-medium) text-heading-3">{section.title}</h3> : section.title}
              <ul className="flex flex-col gap-2 mt-2.5">
                {section.links.map((link, key) => (
                  <li key={key}>
                    <NavLink className="text-body-3 text-(--on-bg-low)" href={link.href}>{link.title}</NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <SocialMediaIcons className="hidden lg:block" />
      </Container>
    </footer>
  );
}

interface SocialMediaIconsProps {
  className?: string,
}

function SocialMediaIcons({ className }: SocialMediaIconsProps) {
  const socialIcons = [
    { icon: <TelegramLogotypeMonoIcon />, href: "https://t.me/rovno_dev" },
    { icon: <VKLogotypeMonoIcon />, href: "https://vk.com/rovno_dev" },
    { icon: <DprofileLogotypeMonoIcon />, href: "https://dprofile.ru/rovno_dev" },
    { icon: <PinterestLogotypeMonoIcon />, href: "https://pinterest.com/rovno_dev" },
  ];

  return (
    <div className={`${className} block`}>
      <h3 className="text-heading-3 text-(--on-bg-medium) sm:text-heading-2">Мы в соц. сетях</h3>
      <div className="flex gap-1 mt-2 sm:flex-wrap lg:flex-nowrap">
        {socialIcons.map((item, key) => (
          <Button variant={'text'} key={key} size={'icon-large'} asChild>
            <Link href={item.href} target="_blank" rel="noopener noreferrer">
              {item.icon}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}