"use client";
import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import {
  ArrowUpRight,
  Code,
  ShieldCheck,
  Pulse,
  Database,
  SpinnerGap,
  SparkleIcon
} from "@phosphor-icons/react";

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section id="services" className="bg-(--bg) text-(--on-bg-high) py-16 md:py-24">
      <Container>
        <div className="flex flex-col gap-12 md:gap-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-4xl lg:text- leading-[1.1] font-sans font-medium tracking-[-0.02em] uppercase text-center w-full break-words"
          >
            {t("services.page.title")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Audit - Vercel style grid & badges */}
            <Link
              href="/services/audit"
              className="group relative md:col-span-2 flex flex-col justify-end p-4 md:p-6 min-h-[320px] md:min-h-[420px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-500 hover:border-(--on-bg-low)/40"
            >
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: "linear-gradient(to right, var(--outline) 1px, transparent 1px), linear-gradient(to bottom, var(--outline) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div
                  className="absolute inset-0 bg-(--bg)/80"
                  style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                />

                <div className="absolute top-[15%] right-[15%] flex flex-col gap-4 items-end transition-transform duration-700 group-hover:-translate-y-2 group-hover:translate-x-2">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-(--card) border border-(--outline) shadow-sm">
                    <Code weight="duotone" className="size-6 text-(--primary)" />
                    <span className="font-semibold text-sm tracking-wide">{t("services.audit.badge1")}</span>
                  </div>
                </div>

                <div className="absolute top-[40%] right-[25%] flex flex-col gap-4 items-end transition-transform duration-700 group-hover:-translate-y-1 group-hover:-translate-x-1">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-(--card) border border-(--outline) shadow-sm">
                    <ShieldCheck weight="duotone" className="size-7 text-(--primary)" />
                    <span className="font-semibold text-sm tracking-wide">{t("services.audit.badge2")}</span>
                  </div>
                </div>

                <div className="absolute top-[65%] right-[5%] flex flex-col gap-4 items-end transition-transform duration-700 group-hover:translate-y-2 group-hover:-translate-x-2">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-(--card) border border-(--outline) shadow-sm">
                    <Pulse weight="duotone" className="size-5 text-(--primary)" />
                    <span className="font-semibold text-sm tracking-wide">{t("services.audit.badge3")}</span>
                  </div>
                </div>

                <div className="absolute top-[80%] right-[35%] flex flex-col gap-4 items-end opacity-40 transition-transform duration-700 group-hover:translate-y-4">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-(--card) border border-(--outline) shadow-sm">
                    <Database weight="duotone" className="size-4 text-(--primary)" />
                    <span className="font-semibold text-xs tracking-wide">{t("services.audit.badge4")}</span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-(--card) via-(--card)/80 to-transparent z-[5] pointer-events-none" />

              <div className="relative z-10 w-full md:w-[85%] mt-auto pointer-events-none">
                <h3 className="text-4xl md:text-2xl lg:text-4xl xl:text-5xl font-medium mb-2 tracking-tight text-(--on-bg-high) group-hover:text-(--primary) transition-colors duration-300">
                  {t("services.audit.short")}
                </h3>
                <p className="text-(--on-bg-medium) leading-relaxed text-sm md:text-base">
                  {t("services.audit.desc")}
                </p>
              </div>
            </Link>

            {/* 2. Digitalization - Chat + Circular Loader after message */}
            <Link
              href="/services/digitalization"
              className="group relative md:col-span-1 flex flex-col justify-end p-4 md:p-6 min-h-[320px] md:min-h-[420px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-500 hover:border-(--on-bg-low)/40"
            >
              <div className="absolute top-0 left-0 right-0 h-[75%] p-5 flex flex-col gap-4 pointer-events-none z-0 overflow-hidden">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="self-end max-w-[90%] bg-(--card) border border-(--outline) rounded-2xl rounded-tr-sm p-3 text-xs leading-relaxed text-(--on-bg-medium) shadow-sm"
                >
                  {t("services.digitalization.chat1")}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="self-start max-w-[95%] bg-(--card) border border-(--outline) rounded-2xl rounded-tl-sm p-3 text-xs leading-relaxed text-(--on-bg-high) shadow-sm relative transition-transform duration-500 group-hover:translate-x-1"
                >
                  {t("services.digitalization.chat2")}
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="self-start flex items-center gap-3 w-full max-w-[95%]"
                >
                  <div className="flex items-center justify-center shrink-0 size-8 rounded-full bg-(--card) border border-(--outline) shadow-sm text-(--primary)">
                    <SpinnerGap className="size-4 animate-spin" weight="bold" />
                  </div>

                  <button className="h-full flex flex-1 items-center justify-between px-3 py-1.5 rounded-full bg-(--card) border border-(--outline) text-[10px] font-semibold uppercase tracking-wider text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--bg) transition-colors shadow-sm">
                    <div className="flex gap-2">
                      <SparkleIcon className="size-3" />
                      {t("services.digitalization.btn")}
                    </div>
                    <ArrowUpRight className="size-3" />
                  </button>
                </motion.div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-(--card) via-(--card) to-transparent z-[5] pointer-events-none" />

              <div className="relative z-10 mt-auto pointer-events-none">
                <h3 className="text-4xl md:text-2xl lg:text-4xl xl:text-5xl font-medium mb-2 tracking-tight text-(--on-bg-high) group-hover:text-(--primary) transition-colors duration-300">
                  {t("services.digitalization.short")}
                </h3>
                <p className="text-(--on-bg-medium) leading-relaxed text-sm">
                  {t("services.digitalization.desc")}
                </p>
              </div>
            </Link>

            {/* 3. Startup - High visibility cascading windows */}
            <Link
              href="/services/startup"
              className="group relative md:col-span-3 flex flex-col justify-end md:flex-row md:items-end md:justify-between p-4 md:p-6 min-h-[320px] md:min-h-[340px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-500 hover:border-(--on-bg-low)/40"
            >
              <div className="absolute inset-y-0 right-0 w-full md:w-[70%] pointer-events-none z-0 overflow-hidden [mask-image:linear-gradient(to_left,black_50%,transparent_100%)]">
                <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-[1200px] h-[1200px] rotate-[-12deg] group-hover:rotate-[-8deg] group-hover:-translate-x-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <div className="grid grid-cols-12 gap-3">
                    {Array.from({ length: 144 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-(--card) border border-(--outline)/80 rounded-lg flex flex-col overflow-hidden opacity-60 group-hover:opacity-100 transition-all duration-700"
                        style={{ transitionDelay: `${(i % 12) * 15}ms` }}
                      >
                        <div className="h-5 border-b border-(--outline)/80 bg-(--bg)/30 flex items-center px-2 gap-1.5">
                          <div className="size-1.5 rounded-full bg-(--on-bg-low)/40" />
                          <div className="size-1.5 rounded-full bg-(--on-bg-low)/40" />
                          <div className="size-1.5 rounded-full bg-(--on-bg-low)/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-(--card) via-(--card)/90 to-transparent pointer-events-none w-full md:w-[50%] z-[5]" />

              <div className="relative z-10 max-w-md pointer-events-none mt-auto">
                <h3 className="text-4xl md:text-2xl lg:text-4xl xl:text-5xl font-medium mb-2 tracking-tight text-(--on-bg-high) group-hover:text-(--primary) transition-colors duration-300">
                  {t("services.startup.short")}
                </h3>
                <p className="text-(--on-bg-medium) leading-relaxed text-sm md:text-base">
                  {t("services.startup.desc")}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
