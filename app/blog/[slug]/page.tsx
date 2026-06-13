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

/* ---------- Simple markdown to HTML converter ---------- */
function markdownToHtml(md: string): string {
  // Escape HTML tags to prevent XSS
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings (## and ###)
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || "text"}">${code.trim()}</code></pre>`;
  });

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Paragraphs: wrap lines that are not already wrapped in block elements
  const lines = html.split("\n");
  const wrapped = lines.map((line) => {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<blockquote") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("</")
    ) {
      return line;
    }
    return `<p>${trimmed}</p>`;
  });

  return wrapped.join("\n");
}

/* ---------- Article page component ---------- */
interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const contentHtml = article.content
    ? markdownToHtml(article.content)
    : `<p>${article.description}</p>`;

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Hero Section – responsive stack */}
      <section className="relative overflow-hidden pt-20 pb-10 md:pb-16">
        <Container>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left column – text (order 1 on mobile) */}
            <div className="order-1 animate-reveal">
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

            {/* Right column – image (order 2 on mobile) */}
            <div className="order-2 relative aspect-[596/447] rounded-2xl overflow-hidden border border-(--outline) bg-(--card) animate-reveal delay-200 fill-mode-both">
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

      {/* Article Content */}
      <section className="py-8 md:py-16">
        <Container>
          <div
            className="prose prose-sm md:prose-base max-w-[720px] mx-auto text-(--on-bg-high) leading-relaxed animate-reveal delay-100 fill-mode-both
              [&_h2]:text-display-4 [&_h2]:text-(--on-bg-high) [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:text-display-5 [&_h3]:text-(--on-bg-high) [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:text-body-2 [&_p]:text-(--on-bg-medium) [&_p]:mb-4
              [&_strong]:text-(--on-bg-high) [&_strong]:font-semibold
              [&_em]:italic
              [&_a]:text-(--primary) [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-(--primary)/80
              [&_blockquote]:border-l-4 [&_blockquote]:border-(--primary) [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-(--on-bg-medium) [&_blockquote]:my-6
              [&_pre]:bg-(--card) [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-(--outline) [&_pre]:my-6
              [&_code]:text-sm [&_code]:bg-(--bg-disabled) [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md
              [&_pre_code]:bg-transparent [&_pre_code]:p-0
            "
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
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
