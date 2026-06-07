"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyboardArrowRightIcon } from "@/components/icons";
import { ARTICLES, Article } from "./data";

function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <a
      href={article.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className="relative overflow-hidden rounded-4xl border border-(--outline) bg-card ring-0 transition-all active:scale-[0.99] aspect-[600/450]">
        <Image
          fill
          src={article.image}
          alt={article.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {article.tags.map((tag) => (
              <Badge
                key={tag}
                variant="glass-static"
                size="chip-small"
                className="text-white border-white/20"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="text-display-3 md:text-display-2 text-white leading-tight max-w-[90%] transition-transform group-hover:-translate-y-1">
            {article.title}
          </h3>
          <p className="mt-2 text-body-3 text-white/80 line-clamp-2">
            {article.description}
          </p>
          <p className="mt-2 text-body-5 text-white/60">
            {new Date(article.date).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="absolute bottom-6 right-6 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            size="icon-small"
            shape="round"
            className="bg-white text-black hover:bg-white"
          >
            <KeyboardArrowRightIcon className="size-5!" />
          </Button>
        </div>
      </Card>
    </a>
  );
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-(--outline)">
        <Container>
          <div className="max-w-[800px] animate-reveal">
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-4">
              Блог
            </h1>
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed">
              Статьи о дизайне, разработке, кейсах и инсайтах нашей команды.
            </p>
          </div>
        </Container>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARTICLES.map((article, idx) => (
              <ArticleCard key={article.id} article={article} index={idx} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
