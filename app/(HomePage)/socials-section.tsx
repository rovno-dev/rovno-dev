/* LLM context: Adding staggering and subtle reveal effects to socials section */

import { DprofileLogotypeMonoIcon, PinterestLogotypeMonoIcon, TelegramLogotypeMonoIcon, VKLogotypeMonoIcon } from "@/components/icons";
import { servicesIconsStyles, ShowcaseCard } from "@/components/layout/showcase-card";
import { Container } from "@/components/ui/container";

export default function SocialsSection() {
  const socials = [
    {
      name: "Канал в Телеге",
      icon: <TelegramLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://t.me/rovno_dev",
      delay: "delay-100"
    },
    {
      name: "Наш ВК",
      icon: <VKLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://vk.com/rovno_dev",
      delay: "delay-150"
    },
    {
      name: "Дипрофайл",
      icon: <DprofileLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://dprofile.ru/rovno_dev",
      delay: "delay-200"
    },
    {
      name: "Пинтерест",
      icon: <PinterestLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://pinterest.com/rovno_dev",
      delay: "delay-250"
    },
  ];

  return (
    <Container className="py-[30px] sm:pt-[75px] lg:pt-[30px] lg:h-[350px] flex flex-col-reverse lg:grid lg:grid-cols-[1fr_300px] gap-[20px] sm:gap-[30px] items-center">
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-1 md:gap-2 w-full sm:h-full">
        {socials.map((social, key) => (
          <div key={key} className={`animate-reveal ${social.delay} fill-mode-both`}>
            <ShowcaseCard href={social.href}>
              {social.icon}
              <p className="text-center text-(--on-bg-high) text-heading-5 sm:text-heading-3 whitespace-normal">
                {social.name}
              </p>
            </ShowcaseCard>
          </div>
        ))}
      </div>

      <div className="w-full animate-reveal delay-300 fill-mode-both">
        <h2 className="text-display-3 md:text-display-2"> Скоро здесь добавится <br /> много интересного...</h2>
        <p className="mt-4">
          <span className="text-body-2 hidden lg:inline">👈</span>
          <span className="text-body-2 inline lg:hidden">👇</span>
          <span> а наши работы также можно посмотреть по ссылкам
            <span className="text-body-2 hidden lg:inline"> слева</span>
            <span className="text-body-2 inline lg:hidden"> ниже</span>
          </span>
        </p>
      </div>
    </Container>
  );
}