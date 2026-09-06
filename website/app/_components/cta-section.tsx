"use client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";

export default function CtaSection() {
  const { t } = useLanguage();
  const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  const TELEGRAM = process.env.NEXT_PUBLIC_CONTACT_TELEGRAM;
  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-[rgba(29,77,122)]/50">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(29,77,122,0.4) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(29,77,122,0.4) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f2b46]/80" />
      </div>
      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-heading font-bold leading-tight tracking-tight text-white mb-6">
            {t("home.cta.title")}<br />
          </h2>
          <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            {t("home.cta.subtitle")}
            <br />
            <span className="text-sm text-white/50">{t("home.cta.note")}</span>
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto sm:max-w-md">
            <Button size="xlarge" variant={'filled'} asChild>
              <Link href={`https://max.ru/${PHONE}`}>{t("home.cta.max")}</Link>
            </Button>
            <Button size="xlarge" variant={'filled'} asChild>
              <Link href={`https://t.me/${TELEGRAM}`}>{t("home.cta.telegram")}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
