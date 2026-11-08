"use client";

import { EditorContent, EditorRoot } from "novel";
import { readonlyExtensions } from "./readonly-extensions";
import type { TocHeading } from "@/components/layout/toc/toc";
import { GalleryLightbox } from "./gallery-lightbox";
import { cn } from "@/lib/utils";
import "@/app/novel-editor.css";

/**
 * Read-only renderer for Tiptap JSON stored in `content_json`.
 * Uses static extensions (no React NodeViews) so the public page
 * renders beautiful HTML without interactive overlays.
 *
 * `GalleryLightbox` is mounted alongside the editor so any gallery image
 * with `data-gallery-image` becomes clickable and opens a full-page
 * carousel preview (caption + index title, arrow-key navigation, dots).
 */
export function NovelReadOnly({
  content,
  className,
  onHeadingsChange,
}: {
  content: any;
  className?: string;
  onHeadingsChange?: (headings: TocHeading[]) => void;
}) {
  if (!content) return null;

  const handleUpdate = ({ editor }: { editor: any }) => {
    if (onHeadingsChange && editor.storage.tableOfContents) {
      const headings = editor.storage.tableOfContents.content || [];
      onHeadingsChange(
        headings.map((h: any) => ({
          id: h.id,
          text: h.textContent,
          level: h.level as 2 | 3,
        }))
      );
    }
  };
  return (
    <>
      <EditorRoot>
        <EditorContent
          initialContent={content}
          extensions={readonlyExtensions as any}
          editable={false}
          className={cn("novel-reader", className)}
          editorProps={{
            attributes: { class: "novel-prosemirror focus:outline-none" },
          }}
          onCreate={handleUpdate}
          onUpdate={handleUpdate}
        />
      </EditorRoot>
      <GalleryLightbox />
    </>
  );
}
