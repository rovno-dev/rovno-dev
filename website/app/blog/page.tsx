import { BlogHeader } from "./_components/blog-header";
import { BlogList } from "./_components/blog-list";
import { fetchPublishedArticlesServer } from "@/utils/api/articles";
import { pageMetadata, buildOgImageUrl } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Журнал",
  description:
    "Статьи о дизайне, разработке, кейсах и инсайтах команды Rovno.dev.",
  path: "/blog",
  ogImage: buildOgImageUrl("Журнал", "Rovno.dev"),
});

// RSC page - fetches published articles at request time (ISR 60s) and
// hands them to a client component that owns the tag filter. The compact
// header is a Client Component of its own (needs the language hook).
export const revalidate = 60;

export default async function BlogPage() {
  const articles = await fetchPublishedArticlesServer({ limit: 100 });

  return (
    <div className="mt-header bg-(--bg)">
      <BlogHeader />
      <div className="pt-8">
        <BlogList articles={articles} />
      </div>
    </div>
  );
}
