"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EditorBubble,
  EditorBubbleItem,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { extensions } from "./extensions";
import { uploadFn } from "./image-upload";
import { cn } from "@/lib/utils";
import "@/app/novel-editor.css";
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  Code,
  ListBullets,
  ListNumbers,
  TextHOne,
  TextHTwo,
  TextHThree,
  ImageSquare,
  TextT,
  ArrowCounterClockwise,
  ArrowClockwise,
  VideoCamera,
  SquaresFour,
  CodeBlock,
  Minus,
} from "@phosphor-icons/react";
import { ImageEditorDialog } from "../image-editor/image-editor-dialog";
import { readFileAsDataURL } from "../image-editor/canvas-utils";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";

export interface NovelEditorProps {
  initialContent: any | null;
  onChange: (json: any) => void;
  className?: string;
}

export function NovelEditor({
  initialContent,
  onChange,
  className,
}: NovelEditorProps) {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editor, setEditor] = useState<any>(null);
  const [cropFile, setCropFile] = useState<{
    dataUrl: string;
    pos: number;
    filename: string;
  } | null>(null);

  const schedule = useCallback(
    (json: any) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => onChange(json), 350);
    },
    [onChange],
  );

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  const uploadMediaFile = async (
    file: File | Blob,
    filename: string,
    isVideo: boolean,
  ) => {
    const fd = new FormData();
    fd.append("file", file, filename);
    const endpoint = isVideo
      ? "/api/v1/uploads/media"
      : "/api/v1/uploads/images";
    const res = await $fetch(endpoint, {
      method: "POST",
      body: fd,
      isToast: false,
    });
    if (!res?.response?.ok)
      throw new Error(res?.json?.detail || "Upload failed");
    return res.json;
  };

  const insertBlockWithTrailingParagraph = (pos: number, node: any) => {
    editor
      .chain()
      .focus()
      .insertContentAt(pos, [node, { type: "paragraph" }])
      .run();
  };

  const handleImageUpload = (pos: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const dataUrl = await readFileAsDataURL(file);
        setCropFile({ dataUrl, pos, filename: file.name });
      }
    };
    input.click();
  };

  const handleVideoUpload = (pos: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/webm";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const tId = toast.loading("Загрузка видео...");
        try {
          const data = await uploadMediaFile(file, file.name, true);
          if (data.url) {
            insertBlockWithTrailingParagraph(pos, {
              type: "video",
              attrs: { src: data.url, poster: data.poster_url },
            });
          }
          toast.success("Видео добавлено", { id: tId });
        } catch {
          toast.error("Ошибка загрузки", { id: tId });
        }
      }
    };
    input.click();
  };

  const handleGalleryUpload = (pos: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files?.length) return;
      const tId = toast.loading("Загрузка галереи...");
      const urls: string[] = [];
      for (const file of Array.from(input.files)) {
        try {
          const data = await uploadMediaFile(file, file.name, false);
          if (data.url) urls.push(data.url);
        } catch {
          /* skip */
        }
      }
      if (urls.length > 0) {
        insertBlockWithTrailingParagraph(pos, {
          type: "gallery",
          attrs: { images: urls },
        });
      }
      toast.success("Галерея добавлена", { id: tId });
    };
    input.click();
  };

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: "novel-prosemirror focus:outline-none",
        // Disables the red squiggly on identifiers, filenames and code
        // text. The browser's spellchecker is user-locale-dependent and
        // fires on every camelCase or snake_case token, which is wrong
        // for every code editor ever built.
        spellcheck: "false",
      },
      handleDOMEvents: {
        keydown: (_view: any, event: KeyboardEvent) =>
          handleCommandNavigation(event),
      },
      handlePaste: (view: any, event: ClipboardEvent) =>
        handleImagePaste(view, event, uploadFn),
      handleDrop: (view: any, event: DragEvent, _slice: any, moved: boolean) =>
        handleImageDrop(view, event, moved, uploadFn),
    }),
    [],
  );

  return (
    <EditorRoot>
      <div
        className={cn(
          "novel-editor rounded-xl border border-(--outline) bg-(--card) flex flex-col relative w-full max-w-full shadow-sm",
          className,
        )}
      >
        {editor && (
          <Toolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
            onGalleryUpload={handleGalleryUpload}
          />
        )}

        <EditorContent
          initialContent={initialContent ?? undefined}
          extensions={extensions as any}
          editorProps={editorProps}
          onUpdate={({ editor }) => schedule(editor.getJSON())}
          onCreate={({ editor }) => setEditor(editor)}
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
        >
          <EditorBubble
            tippyOptions={{ duration: 100, zIndex: 99999 }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-lg border border-(--outline) bg-(--card) shadow-xl"
          >
            <EditorBubbleItem
              onSelect={(ed) => ed.chain().focus().toggleBold().run()}
            >
              <div className="p-2 hover:bg-(--state-hover) cursor-pointer">
                <TextB className="size-4" />
              </div>
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(ed) => ed.chain().focus().toggleItalic().run()}
            >
              <div className="p-2 hover:bg-(--state-hover) cursor-pointer">
                <TextItalic className="size-4" />
              </div>
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(ed) => ed.chain().focus().toggleStrike().run()}
            >
              <div className="p-2 hover:bg-(--state-hover) cursor-pointer">
                <TextStrikethrough className="size-4" />
              </div>
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(ed) => ed.chain().focus().toggleCode().run()}
            >
              <div className="p-2 hover:bg-(--state-hover) cursor-pointer">
                <Code className="size-4" />
              </div>
            </EditorBubbleItem>
          </EditorBubble>

          {/* Notion-Styled Slash Menu - hardcoded items */}
          <EditorCommand className="z-[99999] h-auto max-h-[360px] w-[320px] overflow-y-auto rounded-xl border border-(--outline) bg-(--card) shadow-2xl transition-all">
            <EditorCommandEmpty className="px-3 py-4 text-center text-sm text-(--on-bg-medium)">
              Ничего не найдено
            </EditorCommandEmpty>
            <EditorCommandList className="p-2">
              <div className="text-[11px] font-semibold text-(--on-bg-medium) mb-1 px-2 uppercase tracking-wider">
                Базовые блоки
              </div>

              <EditorCommandItem
                value="text"
                onCommand={({ editor: ed, range }) =>
                  ed.chain().focus().deleteRange(range).setParagraph().run()
                }
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <TextT className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Текст
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Обычный текстовый блок
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="heading1"
                onCommand={({ editor: ed, range }) =>
                  ed
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode("heading", { level: 1 })
                    .run()
                }
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <TextHOne className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Заголовок 1
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Большой заголовок
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="heading2"
                onCommand={({ editor: ed, range }) =>
                  ed
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode("heading", { level: 2 })
                    .run()
                }
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <TextHTwo className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Заголовок 2
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Средний заголовок
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="heading3"
                onCommand={({ editor: ed, range }) =>
                  ed
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode("heading", { level: 3 })
                    .run()
                }
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <TextHThree className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Заголовок 3
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Маленький заголовок
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="bulletList"
                onCommand={({ editor: ed, range }) =>
                  ed
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleBulletList()
                    .run()
                }
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <ListBullets className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Маркированный список
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Список с точками
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="numberedList"
                onCommand={({ editor: ed, range }) =>
                  ed
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleOrderedList()
                    .run()
                }
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <ListNumbers className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Нумерованный список
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Список с номерами
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="codeBlock"
                onCommand={({ editor: ed, range }) =>
                  ed
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleCodeBlock()
                    .run()
                }
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <CodeBlock className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">Код</span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Блок с кодом
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="divider"
                onCommand={({ editor: ed, range }) =>
                  ed
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setHorizontalRule()
                    .run()
                }
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <Minus className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Разделитель
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Разделяет блоки
                  </span>
                </div>
              </EditorCommandItem>

              <div className="text-[11px] font-semibold text-(--on-bg-medium) mt-3 mb-1 px-2 uppercase tracking-wider">
                Медиа
              </div>

              <EditorCommandItem
                value="image"
                onCommand={({ editor: ed, range }) => {
                  ed.chain().focus().deleteRange(range).run();
                  handleImageUpload(ed.view.state.selection.from);
                }}
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <ImageSquare className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Изображение
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Загрузить и обрезать
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="video"
                onCommand={({ editor: ed, range }) => {
                  ed.chain().focus().deleteRange(range).run();
                  handleVideoUpload(ed.view.state.selection.from);
                }}
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <VideoCamera className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">Видео</span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Загрузить mp4 или webm
                  </span>
                </div>
              </EditorCommandItem>

              <EditorCommandItem
                value="gallery"
                onCommand={({ editor: ed, range }) => {
                  ed.chain().focus().deleteRange(range).run();
                  handleGalleryUpload(ed.view.state.selection.from);
                }}
                className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-(--state-hover) cursor-pointer select-none data-[selected=true]:bg-(--state-hover)"
              >
                <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm">
                  <SquaresFour className="size-5 text-(--on-bg-high)" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-(--on-bg-high)">
                    Галерея
                  </span>
                  <span className="text-xs text-(--on-bg-medium)">
                    Сетка из изображений
                  </span>
                </div>
              </EditorCommandItem>
            </EditorCommandList>
          </EditorCommand>
        </EditorContent>
      </div>

      <ImageEditorDialog
        open={!!cropFile}
        onOpenChange={(open) => !open && setCropFile(null)}
        src={cropFile?.dataUrl || null}
        onApply={async (blob, filename) => {
          if (!editor || !cropFile) return;
          const tId = toast.loading("Загрузка...");
          try {
            const data = await uploadMediaFile(blob, filename, false);
            if (data.url) {
              insertBlockWithTrailingParagraph(cropFile.pos, {
                type: "image",
                attrs: { src: data.url },
              });
            }
            toast.success("Добавлено", { id: tId });
          } catch (e: any) {
            toast.error(e.message || "Ошибка", { id: tId });
          }
          setCropFile(null);
        }}
      />
    </EditorRoot>
  );
}

function Toolbar({
  editor,
  onImageUpload,
  onVideoUpload,
  onGalleryUpload,
}: any) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-(--outline) bg-(--card) p-2 shrink-0 rounded-t-xl">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        icon={<TextB className="size-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        icon={<TextItalic className="size-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        icon={<TextStrikethrough className="size-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        icon={<Code className="size-4" />}
      />

      <div className="w-px h-5 bg-(--outline) mx-1" />

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        isActive={editor.isActive("heading", { level: 1 })}
        icon={<TextHOne className="size-4" />}
      />
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor.isActive("heading", { level: 2 })}
        icon={<TextHTwo className="size-4" />}
      />
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        isActive={editor.isActive("heading", { level: 3 })}
        icon={<TextHThree className="size-4" />}
      />

      <div className="w-px h-5 bg-(--outline) mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon={<ListBullets className="size-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon={<ListNumbers className="size-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        icon={<CodeBlock className="size-4" />}
      />

      <div className="w-px h-5 bg-(--outline) mx-1" />

      <ToolbarButton
        onClick={() => onImageUpload(editor.view.state.selection.from)}
        icon={<ImageSquare className="size-4" />}
      />
      <ToolbarButton
        onClick={() => onVideoUpload(editor.view.state.selection.from)}
        icon={<VideoCamera className="size-4" />}
      />
      <ToolbarButton
        onClick={() => onGalleryUpload(editor.view.state.selection.from)}
        icon={<SquaresFour className="size-4" />}
      />

      <div className="w-px h-5 bg-(--outline) mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        icon={<ArrowCounterClockwise className="size-4" />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        icon={<ArrowClockwise className="size-4" />}
      />
    </div>
  );
}

function ToolbarButton({ onClick, isActive, disabled, icon }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        isActive
          ? "bg-(--primary) text-(--on-primary)"
          : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {icon}
    </button>
  );
}
