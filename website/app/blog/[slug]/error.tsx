"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";

export default function BlogArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[blog/[slug]] error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-(--bg) flex items-center justify-center py-20">
      <Container>
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-(--error-card) text-(--error) mb-6">
            <TriangleAlert className="size-8" />
          </div>
          <h1 className="text-display-2 text-(--on-bg-high) mb-4">
            Не удалось загрузить статью
          </h1>
          <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-10">
            Похоже, у нас временные проблемы с сервером. Попробуйте ещё раз через минуту — если не поможет,
            вернитесь в журнал.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="filled" size="large" onClick={reset}>
              <RefreshCw className="size-4" />
              Попробовать снова
            </Button>
            <Button variant="outlined" size="large" asChild>
              <Link href="/blog">
                <ArrowLeft className="size-4" />
                В журнал
              </Link>
            </Button>
          </div>
          {error.digest && (
            <p className="mt-8 text-body-6 text-(--on-bg-low) font-mono">
              digest: {error.digest}
            </p>
          )}
        </div>
      </Container>
    </main>
  );
}
