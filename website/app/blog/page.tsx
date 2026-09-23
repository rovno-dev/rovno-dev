import { Container } from "@/components/ui/container";
import { BlogList } from "./_components/blog-list";
import { fetchPublishedArticlesServer } from "@/utils/api/articles";

// LLM context: RSC page. Fetches published articles at request time (ISR 60s)
// and hands them to a client component that owns the tag filter.
export const revalidate = 60;
export const metadata = {
  title: "Journal · Rovno.dev",
  description: "Articles about design, development, cases, and insights from the Rovno.dev team.",
};
export default async function BlogPage() {
  const articles = await fetchPublishedArticlesServer({ limit: 100 });
  return (
    <main className="min-h-screen bg-(--bg)">
      <section className="py-16 md:py-24 border-b border-(--outline)">
        <Container>
          <div className="max-w-[800px] animate-reveal">
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-4">
              Journal
            </h1>
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed">
              Articles about design, development, cases, and insights from our team.
            </p>
          </div>
        </Container>
      </section>
      <div className="pt-12">
        <BlogList articles={articles} />
      </div>
    </main>
  );
}
