"use client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { TelegramLogotypeMonoIcon } from "@/components/icons";

/** True when the current UTC hour maps to 8:00–22:00 MSK (UTC+3). */
function isWithinWorkingHours(): boolean {
  const mskHours = (new Date().getUTCHours() + 3) % 24;
  return mskHours >= 8 && mskHours < 22;
}

export default function CtaSection() {
  const { t } = useLanguage();
  const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
  const TELEGRAM = process.env.NEXT_PUBLIC_CONTACT_TELEGRAM ?? "";
  const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "rovno.dev@mail.ru";

  // null = not yet computed (SSR pass). Avoids hydration mismatch on the
  // dot's pulse state — the pill renders neutral, then resolves on mount.
  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => {
    const compute = () => setOnline(isWithinWorkingHours());
    compute();
    // Re-check every minute so the pill reflects the transition into/out of
    // working hours without a page reload.
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      {/* Layer 1: blueprint grid, restrained so it reads as texture not decoration */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px),
            linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />
      {/* Layer 2: single radial accent behind the headline */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, var(--primary-glass), transparent 72%)",
        }}
      />
      {/* Layer 3: top/bottom fades so the section blends into the page instead of banding */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-(--bg) to-transparent pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-(--bg) to-transparent pointer-events-none"
      />

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          {/* Availability pill. Dot reflects real working hours, not a decorative pulse. */}
          <div className="inline-flex items-center gap-2 rounded-full border border-(--outline) bg-(--card)/70 backdrop-blur-sm px-3.5 py-1.5 mb-10">
            <span className="relative flex size-2 shrink-0">
              {online === true && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--success) opacity-60" />
              )}
              <span
                className={
                  "relative inline-flex size-2 rounded-full " +
                  (online === true ? "bg-(--success)" : "bg-(--on-bg-low)")
                }
              />
            </span>
            <span className="text-body-5 font-medium uppercase tracking-[0.2em] text-(--on-bg-medium)">
              {t("home.cta.note")}
            </span>
          </div>

          {/* Display headline */}
          <h2 className="text-[3rem] sm:text-[4rem] md:text-[5.5rem] font-heading font-semibold leading-[0.95] tracking-[-0.035em] text-(--on-bg-high) mb-8">
            {t("home.cta.title")}
          </h2>

          {/* Subtitle */}
          <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed max-w-xl mx-auto mb-10 md:mb-12">
            {t("home.cta.subtitle")}
          </p>

          {/* Primary + secondary actions. Telegram carries the brand mark and the
              filled treatment; Max is deliberately quieter so the eye has a
              single primary path. */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:min-w-[440px] mb-14">
            <Button size="xlarge" variant="filled" asChild >
              <Link
                href={`https://t.me/${TELEGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TelegramLogotypeMonoIcon className="size-5! [&>path]:fill-white!" />
                {t("home.cta.telegram")}
              </Link>
            </Button>
            <Button size="xlarge" variant="outlined" asChild >
              <Link
                href={`https://max.ru/${PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("home.cta.max")}
              </Link>
            </Button>
          </div>

          {/* Divider + email fallback. Third path for people who don't use messengers. */}
          <div className="flex items-center gap-4 w-full max-w-sm mx-auto">
            <span className="h-px flex-1 bg-(--outline)" />
            <span className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low)">
              {t("home.cta.or")}
            </span>
            <span className="h-px flex-1 bg-(--outline)" />
          </div>

          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex items-center gap-1.5 mt-6 text-body-3 md:text-body-2 font-medium text-(--on-bg-medium) hover:text-(--primary) transition-colors"
          >
            {EMAIL}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </Container>
    </section>
  );
}
