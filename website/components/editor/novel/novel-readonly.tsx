"use client";
import { EditorContent, EditorRoot } from "novel";
import { readonlyExtensions } from "./readonly-extensions";
import { cn } from "@/lib/utils";
import "@/app/novel-editor.css";

/**
 * Read-only renderer for Tiptap JSON stored in `content_json`.
 * Uses static extensions (no React NodeViews) so the public page
 * renders beautiful HTML without interactive overlays.
 */
export function NovelReadOnly({
  content,
  className,
}: {
  content: any;
  className?: string;
}) {
  if (!content) return null;
  return (
    <EditorRoot>
      <EditorContent
        initialContent={content}
        extensions={readonlyExtensions as any}
        editable={false}
        className={cn("novel-reader", className)}
        editorProps={{
          attributes: { class: "novel-prosemirror focus:outline-none" },
        }}
      />
    </EditorRoot>
  );
}
