"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CircleNotch, MagnifyingGlass, At, FolderSimple, Users,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { searchMentions, type MentionResults } from "@/utils/api/mentions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the markdown string to insert at the cursor. */
  onInsert: (markdown: string) => void;
}

type Item =
  | { kind: "user"; id: string; label: string; sub?: string; avatar?: string | null }
  | { kind: "project"; id: string; label: string; sub?: string; avatar?: string | null }
  | { kind: "client"; id: string; label: string; sub?: string; avatar?: string | null };

/**
 * Insert-a-mention dialog. Searches the three namespaces at once and
 * inserts a markdown link with a `mention://` href. The renderer (see
 * components/mdx) rewrites that href into the actual site route.
 *
 * Insert format examples:
 *   [@niyazgim](mention://user/niyazgim)
 *   [ALX-9](mention://project/alx)
 *   [Concord](mention://client/concord)
 */
export function MentionPicker({ open, onOpenChange, onInsert }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MentionResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setResults(null);
    setLoading(true);
    searchMentions("", 8)
      .then(setResults)
      .finally(() => setLoading(false));
    // Focus the search box after the dialog mounts.
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setLoading(true);
      searchMentions(q, 6)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, open]);

  const items: Item[] = useMemo(() => {
    if (!results) return [];
    const out: Item[] = [];
    for (const u of results.users) {
      out.push({
        kind: "user",
        id: u.username,
        label: `@${u.username}`,
        sub: u.name || undefined,
        avatar: u.avatar_url,
      });
    }
    for (const p of results.projects) {
      out.push({
        kind: "project",
        id: p.slug,
        label: p.title,
        sub: "Проект",
        avatar: p.cover_image_src || null,
      });
    }
    for (const c of results.clients) {
      out.push({
        kind: "client",
        id: c.slug,
        label: c.name,
        sub: "Клиент",
        avatar: c.logotype_url,
      });
    }
    return out;
  }, [results]);

  const handlePick = (item: Item) => {
    const md =
      item.kind === "user"
        ? `[@${item.id}](mention://user/${item.id})`
        : `[${item.label}](mention://${item.kind}/${item.id})`;
    onInsert(md);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-(--outline)">
          <DialogTitle className="text-body-2">Вставить упоминание</DialogTitle>
        </DialogHeader>

        <div className="p-2 border-b border-(--outline)">
          <div className="relative">
            <MagnifyingGlass className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
            <Input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Имя пользователя, проект или клиент…"
              className="pl-9 border-0 focus-visible:ring-0 focus-visible:border-0"
            />
            {loading && (
              <CircleNotch className="size-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-(--on-bg-low)" />
            )}
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-1">
          {items.length === 0 && !loading && (
            <p className="py-8 text-center text-body-4 text-(--on-bg-low)">
              {q ? "Ничего не найдено" : "Начните вводить…"}
            </p>
          )}
          {items.map((item, idx) => (
            <button
              key={`${item.kind}-${item.id}-${idx}`}
              type="button"
              onClick={() => handlePick(item)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-(--state-hover) transition-colors"
            >
              {/* Avatar / logo / fallback icon */}
              <div className="size-9 shrink-0 rounded-lg bg-(--bg) overflow-hidden flex items-center justify-center border border-(--outline)">
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    alt=""
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : item.kind === "user" ? (
                  <At className="size-4 text-(--on-bg-low)" />
                ) : item.kind === "project" ? (
                  <FolderSimple className="size-4 text-(--on-bg-low)" />
                ) : (
                  <Users className="size-4 text-(--on-bg-low)" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-body-4 truncate",
                    item.kind === "user"
                      ? "text-(--primary) font-medium"
                      : "text-(--on-bg-high)",
                  )}
                >
                  {item.label}
                </p>
                {item.sub && (
                  <p className="text-body-6 text-(--on-bg-low) truncate">
                    {item.sub}
                  </p>
                )}
              </div>

              <Badge variant="tonal-card-static" size="chip-small" className="shrink-0">
                {item.kind === "user"
                  ? "Пользователь"
                  : item.kind === "project"
                  ? "Проект"
                  : "Клиент"}
              </Badge>
            </button>
          ))}
        </div>

        <div className="border-t border-(--outline) p-2 flex justify-end">
          <Button variant="text" size="small" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
