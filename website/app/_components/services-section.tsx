"use client";

import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import { useLanguage } from "@/providers/language-provider";
import { AuditCard } from "./service-cards/audit-card";
import { DigitalizationCard } from "./service-cards/digitalization-card";
import { StartupCard } from "./service-cards/startup-card";

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section
      id="services"
      className="bg-(--bg) text-(--on-bg-high) py-20 md:py-28"
    >
      <Container>
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-2 mb-10"
          >
            {t("services.page.title")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <AuditCard />
            <DigitalizationCard />
            <StartupCard />
          </div>
        </div>
      </Container>
    </section>
  );
}
