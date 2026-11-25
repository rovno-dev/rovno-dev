"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Typographic grid: the three services are chapters, not cards. No illustration
// competes with the titles — the hairlines and the scale of the type carry the
// section, and the whole column is the link.
const SERVICES = [
  {
    href: "/services/audit",
    titleKey: "services.audit.short",
    descKey: "services.audit.desc",
  },
  {
    href: "/services/digitalization",
    titleKey: "services.digitalization.short",
    descKey: "services.digitalization.desc",
  },
  {
    href: "/services/startup",
    titleKey: "services.startup.short",
    descKey: "services.startup.desc",
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
          className="text-display-1 mb-10 md:mb-16"
        >
          {t("services.page.title")}
        </motion.h2>

        <div className="grid grid-cols-1 border-t border-(--outline) md:grid-cols-3 md:border-b md:divide-x md:divide-(--outline)">
          {SERVICES.map(({ href, titleKey, descKey }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-b border-(--outline) md:border-b-0"
            >
              <Link
                href={href}
                className={cn(
                  "group flex h-full flex-col py-10 transition-colors duration-500 hover:bg-(--state-hover) md:px-8 md:py-12",
                  i === 0 && "md:pl-0",
                  i === SERVICES.length - 1 && "md:pr-0"
                )}
              >
                <span className="text-body-5 tabular-nums tracking-[0.2em] text-(--on-bg-low) transition-colors duration-300 group-hover:text-(--on-bg-high)">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="mt-8 flex items-start justify-between gap-4 md:mt-10">
                  <h3 className="text-display-2 tracking-tight">
                    {t(titleKey)}
                  </h3>
                  <ArrowUpRight className="mt-2 size-5 shrink-0 text-(--on-bg-low) transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--on-bg-high)" />
                </div>
                <p className="mt-3 max-w-xs text-body-3 text-(--on-bg-medium)">
                  {t(descKey)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
