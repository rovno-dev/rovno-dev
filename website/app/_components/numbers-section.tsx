"use client";
import React from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

export default function NumbersSection() {
  const { t } = useLanguage();
  const stats = [
    {
      number: "4.5 года",
      description: t("home.stats_team_experience"),
      buttonText: t("home.stats_team_btn"),
      href: "/team",
      color: "#3b82f6",
    },
    {
      number: "42",
      description: t("home.stats_projects_done"),
      buttonText: t("home.stats_projects_btn"),
      href: "/projects",
      color: "#f59e0b",
    },
    {
      number: "18",
      description: t("home.stats_happy_clients"),
      buttonText: t("home.stats_clients_btn"),
      href: "/reviews",
      color: "#ec4899",
    },
    {
      number: "1 день",
      description: t("home.stats_spec_prep"),
      buttonText: t("home.stats_spec_btn"),
      href: "/order",
      color: "#a855f7",
    },
  ];
  return (
    <section className="pt-12 sm:pt-18 pb-8 sm:pb-18">
      <Container>
        <h2 className="text-display-2 text-[2rem] sm:text-[3.5rem] mb-8 sm:mb-16 text-left sm:text-center">
          {t("home.numbers_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 [&>*:not(:first-child)]:pt-8 [&>*:not(:last-child)]:pb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative p-0 sm:p-8 lg:p-6 flex flex-col h-full border-(--outline)
                border-b last:border-b-0
                md:border-b-0 md:last:border-b-0 lg:border-r lg:last:border-r-0
                md:[&:nth-child(odd)]:border-r
                md:[&:nth-child(-n+2)]:border-b lg:border-b-0!
                transition-colors hover:bg-(--primary-glass)"
            >
              {/* Colorized radial hover effect */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-15"
                style={{
                  background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 90%)`
                }}
              />
              <div className="relative z-10 flex flex-col flex-1">
                {/* Big number */}
                <h3 className="text-(--on-bg-medium) text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-(--on-bg-high) mb-3">
                  {stat.number}
                </h3>
                {/* Description */}
                <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-8 flex-1">
                  {stat.description}
                </p>
                {/* Button always at bottom */}
                <Button
                  variant="outlined"
                  size="medium"
                  className="w-full mt-auto"
                  asChild
                >
                  <Link href={stat.href}>
                    {stat.buttonText}
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
