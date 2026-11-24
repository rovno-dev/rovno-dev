"use client";

import type { ComponentType } from "react";
import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import { useLanguage } from "@/providers/language-provider";
import {
  CrayonSpecialIcon,
  GlowSpecialIcon,
  HandSpecialIcon,
  PlanetSpecialIcon,
  type IconProps,
} from "@/components/icons";

const ITEMS: { value: string; labelKey: string; Icon: ComponentType<IconProps> }[] = [
  { value: "45", labelKey: "home.stats.projects_label", Icon: CrayonSpecialIcon },
  { value: "18", labelKey: "home.stats.companies_label", Icon: HandSpecialIcon },
  { value: "4.5", labelKey: "home.stats.experience_label", Icon: GlowSpecialIcon },
  { value: "99.9%", labelKey: "home.stats.uptime_label", Icon: PlanetSpecialIcon },
];

export default function NumbersSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 md:gap-y-24">
          {ITEMS.map(({ value, labelKey, Icon }, i) => (
            <motion.div
              key={labelKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col group"
            >
              <Icon className="size-28 md:size-40 mb-8 text-(--on-bg-high) transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-2 group-hover:scale-[1.03]" />
              <div className="text-display-1 tracking-[-0.04em] leading-none text-(--on-bg-high) mb-4 tabular-nums">
                {value}
              </div>
              <div className="text-body-3 md:text-body-2 text-(--on-bg-medium) leading-snug max-w-[200px]">
                {t(labelKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
