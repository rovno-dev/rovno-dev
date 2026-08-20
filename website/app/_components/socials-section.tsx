/* LLM context: Single card with equal-sized divide-x socials */
import { DprofileLogotypeMonoIcon, TelegramLogotypeMonoIcon, VKLogotypeMonoIcon, GithubLogotypeMonoIcon } from "@/components/icons";
import { servicesIconsStyles } from "@/components/layout/showcase-card";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SocialsSection() {
  const socials = [
    {
      name: "Telegram",
      icon: <TelegramLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://t.me/rovno_dev",
    },
    {
      name: "VK",
      icon: <VKLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://vk.com/rovno_dev",
    },
    {
      name: "Dprofile",
      icon: <DprofileLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://dprofile.ru/rovno_dev",
    },
    {
      name: "GitHub",
      icon: <GithubLogotypeMonoIcon className={servicesIconsStyles} />,
      href: "https://github.com/rovno-dev",
    },
  ];

  return (
    <Container className="py-12 md:py-20">
      <div className="space-y-8">
        <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) text-center animate-reveal">
          Наши залипательные медиа
        </h2>
        <div className="animate-reveal delay-100 fill-mode-both">
          <Card className="gap-0! p-0! flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-(--outline) rounded-3xl overflow-hidden border-(--outline) bg-(--card) shadow-md">
            {socials.map((social, idx) => (
              <Link
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-300 hover:bg-(--primary-glass) hover:shadow-inner"
              >
                <div className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:text-(--primary)">
                  {social.icon}
                </div>
                <p className="mt-3 text-center text-heading-5 md:text-heading-3 text-(--on-bg-high) font-medium group-hover:text-(--primary)">
                  {social.name}
                </p>
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </Container>
  );
}
