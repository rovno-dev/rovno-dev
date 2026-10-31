"use client";

import React, { useRef, useState, createContext, useContext } from "react";
import {
  MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin,
  markdownShortcutPlugin, toolbarPlugin, linkPlugin, linkDialogPlugin,
  imagePlugin, codeBlockPlugin, codeMirrorPlugin, diffSourcePlugin,
  frontmatterPlugin, tablePlugin, jsxPlugin, UndoRedo,
  BoldItalicUnderlineToggles, BlockTypeSelect, CreateLink, InsertTable,
  InsertThematicBreak, ListsToggle, Separator, DiffSourceToggleWrapper,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "@/app/mdx-editor-theme.css";
import { Button } from "@/components/ui/button";
import { AtIcon, SquaresFour, EyeIcon, PencilSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";
import { MediaInsertDialog, type InitialMediaData } from "./media-insert-dialog";
import { Gallery } from "@/components/mdx";

const GridEditContext = createContext<((data: InitialMediaData[]) => void) | null>(null);

function parseMedia(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    if (raw.length > 0 && raw[0].type && raw[0].src) return raw;
    return [];
  }
  let str = typeof raw === 'string' ? raw : (raw.value || raw.raw || String(raw));
  if (!str) return [];
  str = str.replace(/\n/g, ' ');
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  try {
    const parsed = new Function(`return (${str})`)();
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  return [];
}

const GalleryEditor = (props: any) => {
  const onEdit = useContext(GridEditContext);
  const parsedMedia = parseMedia(props.media);

  if (parsedMedia.length === 0) {
    return (
      <div className="my-1 border border-dashed border-(--outline) rounded-lg p-2 bg-(--card)/50 flex items-center justify-center">
        <Button
          type="button"
          variant="text"
          size="small"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.stopPropagation(); onEdit?.([]); }}
          className="text-(--on-bg-medium) hover:text-(--on-bg-high) text-xs h-7"
        >
          <SquaresFour className="size-3.5 mr-1.5" />
          Добавить сетку медиа
        </Button>
      </div>
    );
  }

  return (
    <div className="relative group/gallery my-4">
      <div className="absolute top-2 right-2 z-[60] opacity-0 group-hover/gallery:opacity-100 transition-opacity">
        <Button 
          type="button"
          size="small" 
          className="bg-(--primary) text-(--on-primary) shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.stopPropagation(); onEdit?.(parsedMedia); }}
        >
          <PencilSimple className="size-4 mr-2" />
          Редактировать
        </Button>
      </div>
      <Gallery 
        media={parsedMedia} 
        fullWidth={props.fullWidth !== false && props.fullWidth !== "false"} 
        columns={Number(props.columns) || 2} 
        aspectRatio={props.aspectRatio || "4/3"}
      />
    </div>
  );
};

interface EditorImplProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export default function EditorImpl({ markdown, onChange, placeholder }: EditorImplProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[] | null>(null);
  const [editingGridData, setEditingGridData] = useState<InitialMediaData[] | null>(null);

  const codeBlockLanguages: Record<string, string> = {
    js: "JavaScript", ts: "TypeScript", tsx: "TSX", jsx: "JSX",
    css: "CSS", bash: "Bash", json: "JSON", md: "Markdown", text: "Plain text",
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await $fetch("/api/v1/uploads/images", { method: "POST", body: fd, isToast: false });
    if (!res?.response?.ok || !res.json?.url) { toast.error("Image upload failed"); throw new Error("Upload failed"); }
    return res.json.url as string;
  };

  const MediaToolbarButton = () => (
    <Button type="button" variant="text" size="icon-small" title="Вставить медиа сетку" onMouseDown={(e) => e.preventDefault()} onClick={() => { setDroppedFiles(null); setEditingGridData(null); setMediaOpen(true); }} className="text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)">
      <SquaresFour className="size-4" />
    </Button>
  );

  const safeMarkdown = markdown.replace(/\bclassname=/g, "className=");

  return (
    <GridEditContext.Provider value={(data) => { setEditingGridData(data); setMediaOpen(true); }}>
      <div 
        className="mdx-editor-wrapper rounded-xl border border-(--outline) overflow-hidden bg-(--card) relative"
        onDrop={(e) => { if (e.dataTransfer.files?.length > 0) { e.preventDefault(); e.stopPropagation(); setDroppedFiles(Array.from(e.dataTransfer.files)); setEditingGridData(null); setMediaOpen(true); } }}
        onPaste={(e) => { const files = Array.from(e.clipboardData.files); if (files.length > 0) { e.preventDefault(); e.stopPropagation(); setDroppedFiles(files); setEditingGridData(null); setMediaOpen(true); } }}
      >
        <MDXEditor
          ref={editorRef}
          markdown={safeMarkdown}
          onChange={(md) => onChange(md.replace(/\bclassname=/g, "className="))}
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
            jsxPlugin({
              jsxComponentDescriptors: [
                {
                  name: 'Gallery',
                  kind: 'flow',
                  props: [
                    { name: 'fullWidth', type: 'expression' },
                    { name: 'columns', type: 'expression' },
                    { name: 'aspectRatio', type: 'string' },
                    { name: 'media', type: 'expression' },
                  ],
                  Editor: GalleryEditor,
                }
              ]
            }),
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
                  <AtIcon className="size-4 mx-2 text-(--on-bg-medium)" />
                  <EyeIcon className="size-4 mx-2 text-(--on-bg-medium)" />
                </DiffSourceToggleWrapper>
              ),
            }),
          ]}
        />
      </div>
      <MediaInsertDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onInsert={(md) => {
          const ref = editorRef.current;
          if (!ref) return;
          
          // КРИТИЧЕСКИЙ ФИКС: Заменяем ненадежный insertMarkdown на прямое управление строкой
          const currentMd = ref.getMarkdown();
          let newMd = currentMd;
          
          if (editingGridData) {
             const rgx = /<Gallery[\s\S]*?(?:\/>|>[\s\S]*?<\/Gallery>)/;
             if (rgx.test(currentMd)) {
                newMd = currentMd.replace(rgx, md.trim());
             } else {
                newMd = currentMd + '\n\n' + md.trim();
             }
          } else {
             newMd = currentMd + '\n\n' + md.trim();
          }
          
          const sanitized = newMd.replace(/\bclassname=/g, "className=");
          
          // Перезаписываем весь markdown заново
          ref.setMarkdown(sanitized);
          
          // Принудительно синхронизируем React-стейт (иначе на бэк уйдет старый текст)
          onChange(sanitized);
          
          // Фокусируемся в конец
          setTimeout(() => {
            ref.focus(undefined, { defaultSelection: "rootEnd" });
          }, 50);
        }}
        initialFiles={droppedFiles}
        initialData={editingGridData}
      />
    </GridEditContext.Provider>
  );
}
