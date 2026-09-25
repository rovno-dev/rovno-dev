"use client";
import { useRef, useState } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  tablePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  DiffSourceToggleWrapper,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "@/app/mdx-editor-theme.css";
import { Button } from "@/components/ui/button";
import { At } from "@phosphor-icons/react";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";
import { MentionPicker } from "./mention-picker";

interface EditorImplProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export default function EditorImpl({ markdown, onChange, placeholder }: EditorImplProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [mentionOpen, setMentionOpen] = useState(false);

  const codeBlockLanguages: Record<string, string> = {
    js: "JavaScript", ts: "TypeScript", tsx: "TSX", jsx: "JSX",
    css: "CSS", bash: "Bash", json: "JSON", md: "Markdown", text: "Plain text",
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await $fetch("/api/v1/uploads/images", {
      method: "POST",
      body: fd,
      isToast: false,
    });
    if (!res?.response?.ok || !res.json?.url) {
      const msg = res?.json?.detail || "Image upload failed";
      toast.error(msg);
      throw new Error(msg);
    }
    return res.json.url as string;
  };

  // The mention button lives inside the toolbar. MDXEditor renders whatever
  // React node we return from toolbarContents, so we can drop a real React
  // component with its own dialog state in there.
  const MentionToolbarButton = () => (
    <Button
      type="button"
      variant="text"
      size="icon-small"
      title="Вставить упоминание"
      onMouseDown={(e) => e.preventDefault()} // don't blur the editor
      onClick={() => setMentionOpen(true)}
    >
      <At className="size-4" />
    </Button>
  );

  return (
    <>
      <div className="mdx-editor-wrapper rounded-xl border border-(--outline) overflow-hidden bg-(--card)">
        <MDXEditor
          ref={editorRef}
          markdown={markdown}
          onChange={onChange}
          placeholder={placeholder}
          contentEditableClassName="prose-mdx px-5 py-4 min-h-[420px] text-body-3 text-(--on-bg-high) focus:outline-none"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin({ imageUploadHandler: handleImageUpload }),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }),
            codeMirrorPlugin({ codeBlockLanguages }),
            frontmatterPlugin(),
            markdownShortcutPlugin(),
            diffSourcePlugin({ viewMode: "rich-text" }),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <Separator />
                  <BlockTypeSelect />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <InsertThematicBreak />
                  <Separator />
                  <MentionToolbarButton />
                </DiffSourceToggleWrapper>
              ),
            }),
          ]}
        />
      </div>

      <MentionPicker
        open={mentionOpen}
        onOpenChange={setMentionOpen}
        onInsert={(md) => {
          const ref = editorRef.current;
          if (!ref) return;
          // insertMarkdown pushes the string at the current cursor. If the
          // editor lost focus (which it will after clicking the toolbar
          // button), MDXEditor still remembers the last selection.
          ref.insertMarkdown(md);
          ref.focus(undefined, { defaultSelection: "rootEnd" });
        }}
      />
    </>
  );
}
