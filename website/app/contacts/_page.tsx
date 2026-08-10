"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyboardArrowRightIcon, ArticleIcon, DiamondIcon, PublicIcon, StylusNoteIcon } from "@/components/icons";
import { DeployedCodeIcon } from "@/components/icons/unideka-icons/deployed-code-icon";
import { cn } from "@/lib/utils";

/* ---------- Hero Section ---------- */
function HeroSection() {
  return (
    <section className="py-16 md:py-24 border-b border-(--outline)">
      <Container>
        <div className="max-w-[800px] animate-reveal">
          <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-4">
            ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ
          </h1>
          <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed">
            Официальные реквизиты, правовые документы и контактные данные цифрового агентства.
          </p>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Company Details Card ---------- */
const companyDetails = [
  { label: "Полное наименование", value: "ООО «Ровно.дев»" },
  { label: "ИНН / КПП", value: "7700000000 / 770001001" },
  { label: "ОГРН", value: "1234567890123" },
  { label: "Юридический адрес", value: "123000, г. Москва, ул. Тестовая, д. 1, офис 1" },
];

function CompanyDetailsCard() {
  return (
    <Card className="rounded-3xl border border-(--outline) bg-(--card) p-8 ring-0 animate-reveal fill-mode-both">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex size-12 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary)">
          <DiamondIcon className="size-6" />
        </div>
        <h2 className="text-display-4 text-(--on-bg-high)">Реквизиты компании</h2>
      </div>

      <div className="space-y-4">
        {companyDetails.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-start justify-between gap-4 pb-4",
              idx < companyDetails.length - 1 && "border-b border-(--outline)"
            )}
          >
            <span className="text-body-3 text-(--on-bg-medium) shrink-0">{item.label}</span>
            <span className="text-body-3 text-(--on-bg-high) text-right max-w-[60%]">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Documents Card ---------- */
const documents = [
  { title: "Политика конфиденциальности", href: "#" },
  { title: "Пользовательское соглашение", href: "#" },
  { title: "Использование файлов Cookie", href: "#" },
];

function DocumentsCard() {
  return (
    <Card className="rounded-3xl border border-(--outline) bg-(--card) p-8 ring-0 animate-reveal fill-mode-both delay-100">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex size-12 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary)">
          <ArticleIcon className="size-6" />
        </div>
        <h2 className="text-display-4 text-(--on-bg-high)">Документы</h2>
      </div>

      <div className="space-y-3">
        {documents.map((doc, idx) => (
          <Link
            key={idx}
            href={doc.href}
            className="group flex items-center justify-between rounded-xl border border-(--outline) bg-(--card) px-5 py-4 transition-all hover:bg-(--state-hover) active:scale-[0.98]"
          >
            <span className="text-body-3 text-(--on-bg-high)">{doc.title}</span>
            <KeyboardArrowRightIcon className="size-5 text-(--on-bg-low) transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Certificates & Awards Section ---------- */
const certificates = [
  {
    title: "Аккредитованная IT-компания",
    subtitle: "Минцифры РФ",
    icon: <DeployedCodeIcon className="size-8 text-(--primary)" />,
  },
  {
    title: "Сертификат ISO 27001",
    subtitle: "Информационная безопасность",
    icon: <PublicIcon className="size-8 text-(--primary)" />,
  },
  {
    title: "Партнер 1С-Битрикс",
    subtitle: "Золотой сертификат",
    icon: <DiamondIcon className="size-8 text-(--primary)" />,
  },
  {
    title: "Топ-10 RUWARD",
    subtitle: "Рейтинг веб-студий 2023",
    icon: <StylusNoteIcon className="size-8 text-(--primary)" />,
  },
];

function CertificatesSection() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="text-display-2 text-(--on-bg-high) mb-10 animate-reveal">
          Сертификаты и лицензии
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certificates.map((cert, idx) => (
            <Card
              key={idx}
              className="rounded-3xl border border-(--outline) bg-(--card) p-8 ring-0 flex flex-col items-center text-center animate-reveal fill-mode-both"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-(--primary-card) mb-4">
                {cert.icon}
              </div>
              <h3 className="text-body-2 font-medium text-(--on-bg-high) mb-1">
                {cert.title}
              </h3>
              <p className="text-body-4 text-(--on-bg-medium)">{cert.subtitle}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Main Page ---------- */
export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-(--bg)">
      <HeroSection />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompanyDetailsCard />
            <DocumentsCard />
          </div>
        </Container>
      </section>

      <CertificatesSection />
    </main>
  );
}
