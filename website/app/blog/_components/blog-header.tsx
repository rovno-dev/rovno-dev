"use client";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

/**
 * Compact strip above the blog list. Deliberately minimal — the visible
 * heading is smaller than a page hero because the list itself carries
 * the visual weight. Localized via the shared `useLanguage` hook (this
 * file is a Client Component so the RSC page can render it while still
 * swapping on the language switcher).
 */
export function BlogHeader() {
  const { t } = useLanguage();
  return (
    <section className="pt-8 md:pt-10 pb-5 border-b border-(--outline)">
      <Container>
        <h1 className="text-heading-2 md:text-heading-1 text-(--on-bg-high) tracking-tight">
          {t("blog.title")}
        </h1>
      </Container>
    </section>
  );
}
