import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import type { ArticleListItem } from "@/utils/api/articles";

function formatDate(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
export function ArticleCard({
  article,
  index = 0,
  lang,
}: {
  article: ArticleListItem;
  index?: number;
  lang: string;
}) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Card className="relative overflow-hidden rounded-4xl border border-(--outline) bg-card ring-0 transition-all active:scale-[0.99] aspect-[600/450]">
        {article.image_url ? (
          <Image
            fill
            src={article.image_url}
            alt={article.title}
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={90}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.tags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="glass-static"
                  size="chip-small"
                  className={
                    "text-white border-white/20 " +
                    ((tag as any).kind === "category"
                      ? "bg-violet-500/40"
                      : (tag as any).kind === "brand"
                      ? "bg-blue-500/40"
                      : "")
                  }
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          <h3 className="text-display-3 md:text-display-2 text-white leading-tight max-w-[92%] transition-transform group-hover:-translate-y-1">
            {article.title}
          </h3>
          {article.description && (
            <p className="mt-2 text-body-3 text-white/80 line-clamp-2">{article.description}</p>
          )}
          <p className="mt-3 text-body-5 text-white/60">{formatDate(article.date, lang)}</p>
        </div>
        <div className="absolute bottom-6 right-6 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex size-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
            <ArrowUpRightIcon className="size-5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
