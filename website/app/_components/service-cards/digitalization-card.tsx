"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "@/providers/language-provider";
import { ArrowUpRight, SpinnerGap, SparkleIcon } from "@phosphor-icons/react";

export function DigitalizationCard() {
  const { t } = useLanguage();

  return (
    <Link
      href="/services/digitalization"
      className="group relative md:col-span-1 flex flex-col justify-end p-6 md:p-8 min-h-[340px] md:min-h-[440px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-500 hover:border-(--on-bg-low)/40"
    >
      <div className="absolute top-0 left-0 right-0 h-[75%] p-6 md:p-7 flex flex-col gap-4 pointer-events-none z-0 overflow-hidden">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="self-end max-w-[90%] bg-(--card) border border-(--outline) rounded-2xl rounded-tr-sm p-3.5 md:p-4 text-xs leading-relaxed text-(--on-bg-medium) shadow-sm"
        >
          {t("services.digitalization.chat1")}
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="self-start max-w-[95%] bg-(--card) border border-(--outline) rounded-2xl rounded-tl-sm p-3.5 md:p-4 text-xs leading-relaxed text-(--on-bg-high) shadow-sm relative transition-transform duration-500 group-hover:translate-x-1"
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

          <button className="h-full flex flex-1 items-center justify-between px-3 py-1.5 rounded-full bg-(--card) border border-(--outline) text-[10px] uppercase tracking-wider text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--bg) transition-colors shadow-sm">
            <div className="flex gap-2">
              <SparkleIcon className="size-3" />
              {t("services.digitalization.btn")}
            </div>
            <ArrowUpRight className="size-3" />
          </button>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-(--card) via-(--card)/95 to-transparent z-[5] pointer-events-none" />

      <div className="relative z-10 mt-auto pointer-events-none">
        <h3 className="text-4xl md:text-2xl lg:text-4xl xl:text-5xl  mb-2 tracking-tight text-(--on-bg-high) group-hover:text-(--primary) transition-colors duration-300">
          {t("services.digitalization.short")}
        </h3>
        <p className="text-(--on-bg-medium) leading-relaxed text-sm">
          {t("services.digitalization.desc")}
        </p>
      </div>
    </Link>
  );
}
