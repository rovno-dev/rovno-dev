"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";
import {
  GlowSpecialIcon,
  HandSpecialIcon,
  PlanetSpecialIcon,
  type IconProps,
} from "@/components/icons";

// Icon choice follows the gesture the illustration makes: a raised hand for
// "stop and look at what you have" (audit), a spark for the automation flip
// (digitalization), a globe for going to market (startup).
const SERVICES: {
  href: string;
  titleKey: string;
  descKey: string;
  Icon: ComponentType<IconProps>;
}[] = [
  {
    href: "/services/audit",
    titleKey: "services.audit.short",
    descKey: "services.audit.desc",
    Icon: HandSpecialIcon,
  },
  {
    href: "/services/digitalization",
    titleKey: "services.digitalization.short",
    descKey: "services.digitalization.desc",
    Icon: GlowSpecialIcon,
  },
  {
    href: "/services/startup",
    titleKey: "services.startup.short",
    descKey: "services.startup.desc",
    Icon: PlanetSpecialIcon,
  },
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-20 md:py-28 text-(--on-bg-high)">
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-display-1 mb-10 md:mb-14"
        >
          {t("services.page.title")}
        </motion.h2>

        <ul className="border-t border-(--outline)">
          {SERVICES.map(({ href, titleKey, descKey, Icon }, i) => (
            <motion.li
              key={href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-b border-(--outline)"
            >
              <Link
                href={href}
                className="group grid grid-cols-1 items-center gap-6 rounded-xl py-10 transition-colors duration-500 hover:bg-(--state-hover) md:grid-cols-12 md:gap-8 md:py-12"
              >
                <div className="flex md:col-span-3 md:justify-center">
                  <Icon className="size-28 text-(--on-bg-high) transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-3 group-hover:scale-[1.04] md:size-44" />
                </div>

                <div className="md:col-span-8">
                  <span className="mb-3 block text-body-5 tabular-nums tracking-[0.2em] text-(--on-bg-low)">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-display-3 tracking-tight transition-transform duration-500 md:text-display-2 md:group-hover:translate-x-1">
                    {t(titleKey)}
                  </h3>
                  <p className="mt-3 max-w-md text-body-3 text-(--on-bg-medium)">
                    {t(descKey)}
                  </p>
                </div>

                <div className="hidden md:col-span-1 md:flex md:justify-end">
                  <ArrowUpRight className="size-6 text-(--on-bg-low) transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--on-bg-high)" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
