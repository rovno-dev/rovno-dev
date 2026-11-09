"use client";

import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export function StartupCard() {
  const { t } = useLanguage();

  return (
    <Link
      href="/services/startup"
      className="group relative md:col-span-3 flex flex-col justify-end md:flex-row md:items-end md:justify-between p-6 md:p-8 min-h-[340px] md:min-h-[360px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-500 hover:border-(--on-bg-low)/40"
    >
      <div className="absolute inset-y-0 right-0 w-full md:w-[70%] pointer-events-none z-0 overflow-hidden [mask-image:linear-gradient(to_left,black_75%,transparent_100%)]">
        <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-[1200px] h-[1200px] rotate-[-12deg] group-hover:rotate-[-8deg] group-hover:-translate-x-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="grid grid-cols-12 gap-3">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className={cn("h-20 bg-[color-mix(in_srgb,var(--on-bg-high),transparent_96%)] border border-[color-mix(in_srgb,var(--on-bg-high),transparent_86%)] rounded-lg flex flex-col overflow-hidden transition-all duration-700", (i * 7 + 3) % 11 < 2 && "startup-tile-pulse")}
                style={{ transitionDelay: `${(i % 12) * 15}ms`, animationDelay: (i * 7 + 3) % 11 < 2 ? `${((i * 2411) % 2500) / 1000}s` : undefined }}
              >
                <div className="h-5 border-b border-[color-mix(in_srgb,var(--on-bg-high),transparent_88%)] bg-[color-mix(in_srgb,var(--on-bg-high),transparent_94%)] flex items-center px-2 gap-1.5">
                  <div className="size-1.5 rounded-full bg-(--on-bg-medium)/50" />
                  <div className="size-1.5 rounded-full bg-(--on-bg-medium)/50" />
                  <div className="size-1.5 rounded-full bg-(--on-bg-medium)/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-(--card) via-(--card)/90 to-transparent pointer-events-none w-full md:w-[50%] z-[5]" />

      <div className="relative z-10 max-w-md pointer-events-none mt-auto">
        <h3 className="text-4xl md:text-2xl lg:text-4xl xl:text-5xl  mb-2 tracking-tight text-(--on-bg-high) group-hover:text-(--primary) transition-colors duration-300">
          {t("services.startup.short")}
        </h3>
        <p className="text-(--on-bg-medium) leading-relaxed text-sm md:text-base">
          {t("services.startup.desc")}
        </p>
      </div>
    </Link>
  );
}
