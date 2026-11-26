"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { PagePeel } from "@/components/ui/page-peel";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

const SERVICES: {
  href: string;
  titleKey: string;
  descKey: string;
}[] = [
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

/** Layer revealed by the folded corner: blueprint paper under the card. */
function CardUnderlay() {
  return (
    <div className="absolute inset-0 bg-(--bg)">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--outline) 1px, transparent 1px), linear-gradient(to bottom, var(--outline) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(110%_110%_at_100%_100%,var(--primary-card),transparent_65%)]" />
    </div>
  );
}

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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
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
              className={cn(i === 2 && "md:col-span-2 lg:col-span-1")}
            >
              <Link
                href={href}
                className="group relative block aspect-[16/9] overflow-hidden rounded-xl border border-(--outline) bg-(--card) transition-colors duration-300 hover:border-(--on-bg-disabled) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--primary)"
              >
                <PagePeel demoDelay={i * 220} under={<CardUnderlay />}>
                  <div className="relative flex h-full flex-col justify-start overflow-hidden bg-(--card) p-5 md:p-6">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, var(--outline) 1px, transparent 1px), linear-gradient(to bottom, var(--outline) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                        maskImage:
                          "linear-gradient(to bottom, black, transparent 78%)",
                      }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_88%_-10%,var(--primary-card),transparent_70%)]"
                    />

                    <div className="relative">
                      <h3 className="text-[1.75rem] leading-[1.1] tracking-tight xl:text-[2rem]">
                        {t(titleKey)}
                      </h3>
                      <p className="mt-2.5 text-body-4 text-(--on-bg-medium) xl:text-body-3">
                        {t(descKey)}
                      </p>
                    </div>
                  </div>
                </PagePeel>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
