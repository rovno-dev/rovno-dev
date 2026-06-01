/* LLM context: Applying staggered reveal animations to services section grid and typography */

import { DiamondIcon, PublicIcon, StylusNoteIcon } from "@/components/icons";
import { servicesIconsStyles, ShowcaseCard } from "@/components/layout/showcase-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ServicesSection() {
  const HARDCODED_LINKS = {
    "design": "https://dprofile.ru/cases/search?query=rovno_dev&category=1&directions=1,2,3,4,5,6&hasAchievement=all&sortType=DATE",
    "motion": "https://dprofile.ru/cases/search?query=rovno_dev&category=6&directions=30,31,32,33,34,35&hasAchievement=all&sortType=DATE",
    "3D": "https://dprofile.ru/cases/search?query=itera&category=5&directions=26,27,28&hasAchievement=all&sortType=DATE",
    "video": "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka",
    "graphical": "https://dprofile.ru/cases/search?query=itera&category=2&directions=18,43,7,8,9&hasAchievement=all&sortType=DATE",
  };

  const tags = [
    { label: "UI/UX", count: 7, href: HARDCODED_LINKS.design },
    { label: "Motion-дизайн", count: 2, href: HARDCODED_LINKS.motion },
    { label: "3D", count: 2, href: HARDCODED_LINKS['3D'] },
    { label: "Видео", count: 1, href: HARDCODED_LINKS.video },
    { label: "Логотипы и айдентика", count: 3, href: HARDCODED_LINKS.graphical },
  ];

  const services = [
    {
      href: HARDCODED_LINKS.design,
      count: '7',
      title: "UX/UI для сайтов и приложений",
      id: '7',
      icon: <PublicIcon className={servicesIconsStyles} />,
      delay: "delay-100"
    },
    {
      href: "https://dprofile.ru/cases/search?query=rovno_dev&category=5&directions=26,27,28&hasAchievement=all&sortType=DATE",
      count: '5',
      title: `Motion-дизайн и 3D`,
      id: '2',
      icon: <DiamondIcon className={servicesIconsStyles} />,
      delay: "delay-200"
    },
    {
      href: "https://dprofile.ru/cases/search?query=itera&category=2&directions=18,43,7,8,9&hasAchievement=all&sortType=DATE",
      count: '3',
      title: "Логотипы и айдентика",
      id: '3',
      icon: <StylusNoteIcon className={servicesIconsStyles} />,
      delay: "delay-300"
    },
  ];

  return (
    <Container className="items-center grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-[40px] py-16 sm:h-[450px]">
      <div className="animate-reveal">
        <h2 className="text-display-2">
          Дизайн любого уровня <br /> сложности
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, key) => (
            <Button
              size={'chip-medium'}
              variant={'tonal-card'}
              shape={'round'}
              key={key}
              asChild={!!tag.href}
              className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
              style={{ animationDelay: `${key * 50}ms` }}
            >
              {tag.href ? (
                <a href={tag.href}>
                  {tag.label}
                  <Badge size={'chip-small'} variant={'text-static'} className="text-primary">{tag.count}</Badge>
                </a>
              ) : (
                <>
                  {tag.label}
                  <Badge size={'chip-small'} variant={'text-static'} className="text-primary">{tag.count}</Badge>
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:w-full sm:h-full">
        {services.map((item, key) => (
          <div key={key} className={`animate-reveal ${item.delay} fill-mode-both`}>
            <ShowcaseCard id={item.id} count={item.count} href={item.href}>
              {item.icon}
              <p className="text-(--on-bg-high) text-center text-heading-5 sm:text-heading-3 whitespace-normal">
                {item.title}
              </p>
            </ShowcaseCard>
          </div>
        ))}
      </div>
    </Container>
  );
}