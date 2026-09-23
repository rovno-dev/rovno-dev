"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Article } from "@/utils/api/articles";
import { MDXRemote } from "next-mdx-remote";
import {
  Gallery,
  MetricCard,
  MDXImage,
  MDXBlockquote,
  MDXCode,
  MDXPre,
  MDXList,
  MDXListItem,
  MDXParagraph,
  MDXHr,
  MDXLink,
  MDXTable,
  MDXThead,
  MDXTh,
  MDXTd,
  MDXCard,
} from "@/components/mdx";

const components = {
  img: MDXImage,
  blockquote: MDXBlockquote,
  code: MDXCode,
  pre: MDXPre,
  ul: (props: any) => <MDXList ordered={false} {...props} />,
  ol: (props: any) => <MDXList ordered={true} {...props} />,
  li: MDXListItem,
  p: MDXParagraph,
  hr: MDXHr,
  a: MDXLink,
  table: MDXTable,
  thead: MDXThead,
  th: MDXTh,
  td: MDXTd,
  Card: MDXCard,
  Gallery,
  MetricCard,
};

export function ArticlePreviewBody({ article }: { article: Article }) {
  // Client-side MDX compile: serialized source goes over the wire once,
  // then next-mdx-remote parses it in a worker-free synchronous path.
  const [compiled, setCompiled] = useState<React.ReactNode>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("next-mdx-remote").then(({ serialize }) => {
      serialize(article.mdx_content || "", { scope: {}, MDXRemote: undefined } as any).then((res) => {
        if (cancelled) return;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        setCompiled(<MDXRemote {...res} components={components} />);
        setReady(true);
      }).catch(() => setReady(true));
    });
    return () => { cancelled = true; };
  }, [article.mdx_content]);

  return (
    <div className="space-y-4">
      {article.image_url && (
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-3xl border border-(--outline) bg-(--card)">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <Badge key={t.id} variant="tonal-card-static" size="chip-small">
              {t.name}
            </Badge>
          ))}
        </div>
      )}
      <Card className="rounded-3xl border border-(--outline) bg-(--card) p-6 md:p-10">
        {!ready ? (
          <div className="flex items-center justify-center py-12 text-(--on-bg-low)">
            <Loader2 className="size-4 animate-spin mr-2" />
            Компиляция MDX…
          </div>
        ) : compiled ? (
          <div className="prose-mdx max-w-none">{compiled}</div>
        ) : (
          <p className="text-body-3 text-(--on-bg-medium)">
            Содержимое пустое.
          </p>
        )}
      </Card>
    </div>
  );
}
