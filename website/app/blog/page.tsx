import { BlogHeader } from "./_components/blog-header";
import { BlogList } from "./_components/blog-list";
import { fetchPublishedArticlesServer } from "@/utils/api/articles";

// RSC page — fetches published articles at request time (ISR 60s) and
// hands them to a client component that owns the tag filter. The compact
// header is a Client Component of its own (needs the language hook).
export const revalidate = 60;

export const metadata = {
  title: "Journal · Rovno.dev",
  description:
    "Articles about design, development, cases, and insights from the Rovno.dev team.",
};

export default async function BlogPage() {
  const articles = await fetchPublishedArticlesServer({ limit: 100 });

  return (
    <main className="min-h-screen bg-(--bg)">
      <BlogHeader />
      <div className="pt-8">
        <BlogList articles={articles} />
      </div>
    </main>
  );
}
