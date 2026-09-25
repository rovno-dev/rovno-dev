import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, BookOpenIcon } from "@phosphor-icons/react";
import { fetchPublishedArticlesServer } from "@/utils/api/articles";

// HardDrives component so it can pull the recent-articles list without an
// extra client fetch. Wrapped in try/catch — a 404 page that itself 500s
// is the worst possible outcome.
async function getRecentArticles() {
  try {
    const all = await fetchPublishedArticlesServer({ limit: 4 });
    return all;
  } catch {
    return [];
  }
}

export default async function BlogArticleNotFound() {
  const recent = await getRecentArticles();

  return (
    <main className="min-h-screen bg-(--bg) flex items-center justify-center py-20">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-body-5 uppercase tracking-[0.35em] text-(--on-bg-low) mb-4">
            404 · Journal
          </p>
          <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-6 leading-tight">
            Такой статьи нет
          </h1>
          <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-10 max-w-md mx-auto">
            Возможно, ссылка устарела, статья была переименована или её никогда не существовало.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Button variant="filled" size="large" asChild>
              <Link href="/blog">
                <BookOpenIcon className="size-4" />
                Все статьи
              </Link>
            </Button>
            <Button variant="outlined" size="large" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
                На главную
              </Link>
            </Button>
          </div>

          {recent.length > 0 && (
            <div className="border-t border-(--outline) pt-10">
              <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low) mb-6">
                Возможно, вы искали
              </p>
              <ul className="space-y-2 text-left">
                {recent.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/blog/${a.slug}`}
                      className="block rounded-2xl border border-(--outline) bg-(--card) px-5 py-4 transition-colors hover:bg-(--state-hover) group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-body-3 text-(--on-bg-high) truncate group-hover:text-(--primary) transition-colors">
                          {a.title}
                        </span>
                        <span className="text-body-5 text-(--on-bg-low) shrink-0">→</span>
                      </div>
                      {a.description && (
                        <p className="text-body-5 text-(--on-bg-medium) mt-1 line-clamp-1">
                          {a.description}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
