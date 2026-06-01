/* LLM context: Updating socials-section.tsx to use links and updated dprofile handle */

import { DprofileLogotypeMonoIcon, PinterestLogotypeMonoIcon, TelegramLogotypeMonoIcon, VKLogotypeMonoIcon } from "@/components/icons";
import { servicesIconsStyles, ShowcaseCard } from "@/components/layout/showcase-card";
import { Container } from "@/components/ui/container";

export default function SocialsSection() {
  const socials = [
    {
      name: "Канал в Телеге",
      icon: <TelegramLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://t.me/rovno_dev"
    },
    {
      name: "Паблик в ВК",
      icon: <VKLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://vk.com/rovno_dev"
    },
    {
      name: "Дипрофайл",
      icon: <DprofileLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://dprofile.ru/rovno_dev"
    },
    {
      name: "Пинтерест",
      icon: <PinterestLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://pinterest.com/rovno_dev"
    },
  ];

  return (
    <Container className="py-[30px] sm:pt-[75px] lg:pt-[30px] lg:h-[350px] flex flex-col-reverse lg:grid lg:grid-cols-[1fr_300px] gap-[20px] sm:gap-[30px] items-center">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 md:gap-2 w-full sm:h-full">
        {socials.map((social, key) => (
          <ShowcaseCard key={key} href={social.href}>
            {social.icon}
            <p className="text-(--on-bg-high) text-heading-5 sm:text-heading-3 whitespace-normal">
              {social.name}
            </p>
          </ShowcaseCard>
        ))}
      </div>

      <div className="w-full">
        <h2 className="text-display-3"> Скоро здесь добавится <br /> много интересного,</h2>
        <p className="mt-4">
          <span className="hidden lg:inline">👈</span>
          <span className="inline lg:hidden">👇</span>
          <span> а наши работы можно посмотреть по ссылкам
            <span className="hidden lg:inline"> слева</span>
            <span className="inline lg:hidden"> ниже</span>
          </span>
        </p>
      </div>
    </Container>
  );
}