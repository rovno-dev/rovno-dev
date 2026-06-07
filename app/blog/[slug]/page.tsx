"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyboardArrowRightIcon } from "@/components/icons";
import { ARTICLES } from "../data";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pb-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left column – text */}
            <div className="animate-reveal">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="glass-static" size="chip-small">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-6 leading-tight">
                {article.title}
              </h1>

              <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) mb-8 max-w-[576px]">
                {article.description}
              </p>

              <p className="text-body-5 text-(--on-bg-low) mb-8">
                {new Date(article.date).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <Button size="large" shape="round" asChild>
                <Link href={article.href} target="_blank" rel="noopener noreferrer">
                  Читать в Telegram
                  <KeyboardArrowRightIcon className="size-5" />
                </Link>
              </Button>
            </div>

            {/* Right column – image */}
            <div className="relative aspect-[596/447] rounded-2xl overflow-hidden border border-(--outline) bg-(--card) animate-reveal delay-200 fill-mode-both">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      {/* Back link */}
      <section className="pb-16">
        <Container>
          <Button variant="text" size="medium" asChild>
            <Link href="/blog">
              ← Назад к списку статей
            </Link>
          </Button>
        </Container>
      </section>
    </main>
  );
}
