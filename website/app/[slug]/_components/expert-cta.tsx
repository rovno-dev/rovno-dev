"use client";
import Link from "next/link";
import { ArrowUpRight, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { declineRussianFirstName } from "@/utils/russian-name";

interface Props {
  /** Full display name as stored in the DB. Only the first word is used. */
  displayName: string;
}

/**
 * Closing CTA on the expert page. Client-side because it needs the active
 * language: Russian form declines the name into the instrumental case
 * ("работать с Ниязом"), English leaves it untouched ("work with Niyaz").
 */
export function ExpertCTA({ displayName }: Props) {
  const { lang } = useLanguage();

  // Pull just the first word and clean any leading @ (usernames sometimes
  // arrive that way). Empty when nothing was set on the user record.
  const rawFirst =
    (displayName || "").trim().split(/\s+/)[0]?.replace(/^@/, "") || "";

  const nameRu = rawFirst ? declineRussianFirstName(rawFirst) : "";
  const nameEn = rawFirst;

  const eyebrow = lang === "ru" ? "Сотрудничество" : "Work with us";

  const heading =
    lang === "ru" ? (
      nameRu ? (
        <>
          Хотите работать с{" "}
          <span className="text-(--primary)">{nameRu}</span>?
        </>
      ) : (
        <>
          Хотите работать <span className="text-(--primary)">вместе</span>?
        </>
      )
    ) : nameEn ? (
      <>
        Want to work with{" "}
        <span className="text-(--primary)">{nameEn}</span>?
      </>
    ) : (
      <>
        Want to work <span className="text-(--primary)">together</span>?
      </>
    );

  return (
    <section className="pt-24 md:pt-32">
      <div className="max-w-[1200px] mx-auto">
        <div className="relative rounded-5xl border border-(--outline) bg-(--card) p-8 md:p-14 overflow-hidden text-center">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 90% at 50% 0%, var(--primary-glass), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkle className="size-4 text-(--primary)" weight="fill" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
                {eyebrow}
              </span>
            </div>

            <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight mb-6 max-w-2xl mx-auto leading-[1.1]">
              {heading}
            </h2>

            <div className="flex justify-center">
              <Button size="large" asChild>
                <Link href="/order">
                  {lang === "ru" ? "Оформить заказ" : "Start a project"}
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
