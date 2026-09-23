"use client";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import type { ArticleListItem, TagRef } from "@/utils/api/articles";
import { ArticleCard } from "./article-card";

export function BlogList({ articles }: { articles: ArticleListItem[] }) {
  const { t, lang } = useLanguage();

  // Unique tag set built from every article, keyed by slug so a rename of the
  // display name doesn't fork the filter. Sorted alphabetically.
  const allTags = useMemo(() => {
    const map = new Map<string, TagRef>();
    articles.forEach((a) =>
      (a.tags || []).forEach((tag) => {
        if (!map.has(tag.slug)) map.set(tag.slug, tag);
      })
    );
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [articles]);

  const [activeTag, setActiveTag] = useState<string | null>(null); // slug

  const filtered = useMemo(() => {
    if (!activeTag) return articles;
    return articles.filter((a) =>
      (a.tags || []).some((tag) => tag.slug === activeTag)
    );
  }, [articles, activeTag]);

  return (
    <section className="pb-24 md:pb-32">
      <Container>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 animate-reveal">
            <Button
              variant={activeTag === null ? "filled" : "tonal-card"}
              size="chip-medium"
              shape="round"
              onClick={() => setActiveTag(null)}
            >
              {t("blog.all")}
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag.slug}
                variant={activeTag === tag.slug ? "filled" : "tonal-card"}
                size="chip-medium"
                shape="round"
                onClick={() => setActiveTag(tag.slug)}
              >
                {tag.name}
              </Button>
            ))}
          </div>
        )}
        {filtered.length === 0 ? (
          <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
            {articles.length === 0 ? t("blog.empty") : t("blog.empty_filtered")}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((article, idx) => (
              <ArticleCard key={article.id} article={article} index={idx} lang={lang} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
