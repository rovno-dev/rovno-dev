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
import { AtIcon, SquaresFour, EyeIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { MentionPicker } from "./mention-picker";
import { MediaInsertDialog } from "./media-insert-dialog";
import { usePathname } from "next/navigation";

interface EditorImplProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export default function EditorImpl({ markdown, onChange, placeholder }: EditorImplProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[] | null>(null);
  const pathname = usePathname();

  const codeBlockLanguages: Record<string, string> = {
    js: "JavaScript", ts: "TypeScript", tsx: "TSX", jsx: "JSX",
    css: "CSS", bash: "Bash", json: "JSON", md: "Markdown", text: "Plain text",
  };

  const MentionToolbarButton = () => (
    <Button
      type="button"
      variant="text"
      size="icon-small"
      title="Вставить упоминание"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => setMentionOpen(true)}
      className="text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)"
    >
      <AtIcon className="size-4" />
    </Button>
  );

  const MediaToolbarButton = () => (
    <Button
      type="button"
      variant="text"
      size="icon-small"
      title="Вставить медиа (фото/видео/сетка)"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        setDroppedFiles(null);
        setMediaOpen(true);
      }}
      className="text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)"
    >
      <SquaresFour className="size-4" />
    </Button>
  );

  const PreviewToolbarButton = () => (
    <Button
      type="button"
      variant="text"
      size="icon-small"
      title="Предпросмотр статьи"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        const match = pathname?.match(/\/articles\/(.+)\/edit/);
        if (match && match[1]) {
          window.open(`/app/profile/articles/${match[1]}/preview`, "_blank");
        } else {
          toast.info("Сохраните статью, чтобы увидеть предпросмотр дизайна");
        }
      }}
      className="text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)"
    >
      <EyeIcon className="size-4" />
    </Button>
  );

  return (
    <>
      <div 
        className="mdx-editor-wrapper rounded-xl border border-(--outline) overflow-hidden bg-(--card) relative"
        onDrop={(e) => {
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            setDroppedFiles(Array.from(e.dataTransfer.files));
            setMediaOpen(true);
          }
        }}
        onPaste={(e) => {
          const files = Array.from(e.clipboardData.files);
          if (files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            setDroppedFiles(files);
            setMediaOpen(true);
          }
        }}
      >
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
            imagePlugin({ 
              imageUploadHandler: async () => "", 
              // Re-enable the native button so users can edit alt/title/link
              disableImageSettingsButton: false,
              disableImageResize: false,
            }),
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
                  <MediaToolbarButton />
                  <InsertTable />
                  <InsertThematicBreak />
                  <Separator />
                  <MentionToolbarButton />
                  <PreviewToolbarButton />
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
          ref.insertMarkdown(md);
          ref.focus(undefined, { defaultSelection: "rootEnd" });
        }}
      />
      <MediaInsertDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onInsert={(md) => {
          const ref = editorRef.current;
          if (!ref) return;
          ref.insertMarkdown(md);
          ref.focus(undefined, { defaultSelection: "rootEnd" });
        }}
        initialFiles={droppedFiles}
      />
    </>
  );
}
