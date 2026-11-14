"use client";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

/**
 * Compact strip above the blog list. Deliberately minimal - the visible
 * heading is smaller than a page hero because the list itself carries
 * the visual weight. Localized via the shared `useLanguage` hook (this
 * file is a Client Component so the RSC page can render it while still
 * swapping on the language switcher).
 */
export function BlogHeader() {
  const { t } = useLanguage();
  return (
    <Container>
      <h1 className="mb-6 pt-6 md:pt-8 text-display-4 md:text-display-3">
        {t("blog.title")}
      </h1>
    </Container>
  );
}
