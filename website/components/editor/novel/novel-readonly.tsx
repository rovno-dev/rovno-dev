"use client";

import { EditorContent, EditorRoot } from "novel";
import { extensions } from "./extensions";
import { cn } from "@/lib/utils";
import "@/app/novel-editor.css";

/**
 * Read-only renderer for Tiptap JSON stored in `content_json`.
 * Tiptap validates the JSON against the schema, so unknown/malicious nodes
 * are dropped instead of being rendered — no dangerouslySetInnerHTML needed.
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
        extensions={extensions}
        editable={false}
        className={cn("novel-reader", className)}
        editorProps={{
          attributes: { class: "novel-prosemirror focus:outline-none" },
        }}
      />
    </EditorRoot>
  );
}
