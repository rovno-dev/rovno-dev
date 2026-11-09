"use client";

import { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  Trash,
  Crop,
  Plus,
  Eye,
  PencilSimple,
} from "@phosphor-icons/react";
import { ImageEditorDialog } from "../image-editor/image-editor-dialog";
import { GalleryPreviewModal } from "./gallery-preview-modal";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const uploadImageBlob = async (blob: Blob, filename: string) => {
  const fd = new FormData();
  fd.append("file", new File([blob], filename, { type: blob.type }));
  const res = await $fetch("/api/v1/uploads/images", { method: "POST", body: fd, isToast: false });
  if (!res?.response?.ok) throw new Error("Upload failed");
  return res.json.url;
};

// --- 1. Image Node View --------------------------------------------------
export function ImageNodeView({ node, deleteNode, updateAttributes }: any) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const { src, alt } = node.attrs;

  return (
    <NodeViewWrapper className="relative group my-6 flex flex-col items-center w-full max-w-full">
      <div className="relative overflow-hidden rounded-sm border border-(--outline) max-w-full">
        <img src={src} alt={alt} className="w-full h-auto block max-h-[800px] object-contain" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-sm">
          <button type="button" onClick={() => setCropSrc(src)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-md backdrop-blur-sm transition-colors" title="Обрезать">
            <Crop className="size-5" />
          </button>
          <button type="button" onClick={deleteNode} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-md backdrop-blur-sm transition-colors" title="Удалить">
            <Trash className="size-5" />
          </button>
        </div>
      </div>
      <ImageEditorDialog
        open={!!cropSrc}
        onOpenChange={(open) => !open && setCropSrc(null)}
        src={cropSrc}
        onApply={async (blob, filename) => {
          const tId = toast.loading("Обрезка...");
          try {
            const url = await uploadImageBlob(blob, filename);
            updateAttributes({ src: url });
            toast.success("Готово", { id: tId });
          } catch { toast.error("Ошибка", { id: tId }); }
          setCropSrc(null);
        }}
      />
    </NodeViewWrapper>
  );
}

// --- 2. Video Node View --------------------------------------------------
export function VideoNodeView({ node, deleteNode }: any) {
  const { src, poster } = node.attrs;
  return (
    <NodeViewWrapper className="relative group my-6 flex flex-col items-center w-full max-w-full">
      <div className="relative overflow-hidden rounded-sm border border-(--outline) w-full bg-black">
        <video src={src} poster={poster} controls className="w-full h-auto block" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={deleteNode} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-md backdrop-blur-sm transition-colors" title="Удалить">
            <Trash className="size-4" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// --- 3. Gallery Node View ------------------------------------------------
//
// The editor preview always renders at the editor column width (never
// breaks out to viewport) so the admin layout stays intact. The
// "Edge-to-edge" toggle is a publish-time flag — the badge explains what
// will happen on the public page.
export function GalleryNodeView({ node, deleteNode, updateAttributes }: any) {
  const {
    images = [],
    captions = [],
    isFullWidth = false,
    layout = "grid",
    columns = 2,
  } = node.attrs;

  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [captionEditing, setCaptionEditing] = useState<number | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");

  const gridColsClass = (c: number) =>
    c === 1 ? "grid-cols-1" : "grid-cols-2";

  const masonryColsClass = (c: number) =>
    c === 1 ? "columns-1" : "columns-1 md:columns-2";

  const handleRemove = (idx: number) => {
    const nextImages = [...images];
    nextImages.splice(idx, 1);
    const nextCaptions = [...captions];
    nextCaptions.splice(idx, 1);
    updateAttributes({ images: nextImages, captions: nextCaptions });
  };

  const handleAdd = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files?.length) return;
      const tId = toast.loading("Загрузка...");
      const newImages = [...images];
      const newCaptions = [...captions];
      for (const file of Array.from(input.files)) {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await $fetch("/api/v1/uploads/images", { method: "POST", body: fd, isToast: false });
          if (res?.json?.url) {
            newImages.push(res.json.url);
            newCaptions.push(file.name.replace(/\.[^.]+$/, ""));
          }
        } catch { /* skip */ }
      }
      updateAttributes({ images: newImages, captions: newCaptions });
      toast.success("Добавлено", { id: tId });
    };
    input.click();
  };

  const startCaptionEdit = (idx: number) => {
    setCaptionEditing(idx);
    setCaptionDraft(captions[idx] || "");
  };

  const saveCaption = (idx: number) => {
    const next = [...captions];
    next[idx] = captionDraft;
    updateAttributes({ captions: next });
    setCaptionEditing(null);
  };

  const previewItems = images.map((src: string, i: number) => ({
    src,
    caption: captions[i] || "",
  }));

  return (
    <NodeViewWrapper className="my-8 group/gallery w-full max-w-full">
      <div className="rounded-xl border border-(--outline) p-4 bg-(--bg)/40 transition-all w-full overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs  text-(--on-bg-medium) uppercase tracking-wider">
              Галерея {images.length > 0 && `(${images.length})`}
            </span>
            {isFullWidth && (
              <span
                className="text-[10px] uppercase tracking-wider text-(--primary) px-1.5 py-0.5 rounded bg-(--primary-glass) border border-(--primary)/30"
                title="На публичной странице галерея растянется на всю ширину экрана без отступов"
              >
                Edge-to-edge
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center" data-gallery-control>
            <button
              type="button"
              onClick={() => updateAttributes({ layout: layout === "masonry" ? "grid" : "masonry" })}
              className="px-2.5 py-1 text-[11px] rounded border border-(--outline) hover:bg-(--state-hover) text-(--on-bg-medium) transition-colors"
              title="Раскладка"
            >
              {layout === "masonry" ? "Мозаика" : "Сетка"}
            </button>
            <select
              value={columns}
              onChange={(e) => updateAttributes({ columns: Number(e.target.value) })}
              className="px-2 py-1 text-[11px] rounded border border-(--outline) bg-transparent text-(--on-bg-medium) outline-none"
              title="Количество колонок"
            >
              {[1, 2].map((n) => (
                <option key={n} value={n}>{n} кол.</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => updateAttributes({ isFullWidth: !isFullWidth })}
              className={cn(
                "px-2.5 py-1 text-[11px] rounded border transition-colors",
                isFullWidth
                  ? "border-(--primary) bg-(--primary-glass) text-(--primary)"
                  : "border-(--outline) hover:bg-(--state-hover) text-(--on-bg-medium)"
              )}
              title="На всю ширину экрана без отступов (Fullpage)"
            >
              {isFullWidth ? "Edge-to-edge" : "В ширину статьи"}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="px-2.5 py-1 text-[11px] rounded border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors"
              title="Удалить галерею"
            >
              Удалить
            </button>
          </div>
        </div>

        {/* Preview grid */}
        {images.length === 0 ? (
          <p className="text-xs text-(--on-bg-low) py-8 text-center">Нет изображений. Нажмите «Добавить».</p>
        ) : (
          <div
            className={cn(
              "w-full",
              layout === "masonry"
                ? masonryColsClass(columns)
                : cn("grid", gridColsClass(columns)),
            )}
          >
            {images.map((src: string, i: number) => {
              const isEditingCaption = captionEditing === i;
              return (
                <div
                  key={i}
                  className={cn(
                    "relative group/img overflow-hidden animate-in fade-in zoom-in-95 duration-300",
                    layout === "masonry" && "break-inside-avoid",
                  )}
                >
                  <img
                    src={src}
                    alt={captions[i] || ""}
                    className={cn(
                      "w-full block transition-transform duration-500 ease-out group-hover/img:scale-105",
                      layout === "grid" ? "aspect-[4/3] object-cover" : "h-auto",
                    )}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors duration-300 pointer-events-none" />
                  {captions[i] && !isEditingCaption && (
                    <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-black/60 backdrop-blur-sm transform translate-y-full group-hover/img:translate-y-0 transition-transform duration-300">
                      <p className="text-[10px] text-white truncate">{captions[i]}</p>
                    </div>
                  )}
                  {isEditingCaption && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/85 backdrop-blur-sm" data-gallery-control>
                      <input
                        autoFocus
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCaption(i);
                          if (e.key === "Escape") setCaptionEditing(null);
                        }}
                        onBlur={() => saveCaption(i)}
                        placeholder="Заголовок..."
                        className="w-full px-2 py-1 text-xs rounded bg-black/50 text-white border border-white/20 outline-none focus:border-(--primary)"
                      />
                    </div>
                  )}
                  <div
                    className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200"
                    data-gallery-control
                  >
                    <button
                      type="button"
                      onClick={() => { setPreviewIndex(i); setPreviewOpen(true); }}
                      className="size-7 flex items-center justify-center rounded bg-black/70 hover:bg-black text-white backdrop-blur-sm transition-colors"
                      title="Просмотр"
                    >
                      <Eye className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplaceIndex(i)}
                      className="size-7 flex items-center justify-center rounded bg-black/70 hover:bg-black text-white backdrop-blur-sm transition-colors"
                      title="Заменить"
                    >
                      <Crop className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startCaptionEdit(i)}
                      className="size-7 flex items-center justify-center rounded bg-black/70 hover:bg-black text-white backdrop-blur-sm transition-colors"
                      title="Подпись"
                    >
                      <PencilSimple className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="size-7 flex items-center justify-center rounded bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm transition-colors"
                      title="Удалить"
                    >
                      <Trash className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add more */}
        <div className="mt-4 flex justify-end" data-gallery-control>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border-2 border-dashed border-(--outline) text-(--on-bg-low) hover:text-(--primary) hover:border-(--primary) hover:bg-(--primary-glass) transition-all duration-200"
          >
            <Plus className="size-4" />
            Добавить изображения
          </button>
        </div>
      </div>

      <ImageEditorDialog
        open={replaceIndex !== null}
        onOpenChange={(open) => !open && setReplaceIndex(null)}
        src={replaceIndex !== null ? images[replaceIndex] : null}
        onApply={async (blob, filename) => {
          if (replaceIndex === null) return;
          const tId = toast.loading("Замена...");
          try {
            const url = await uploadImageBlob(blob, filename);
            const next = [...images];
            next[replaceIndex] = url;
            updateAttributes({ images: next });
            toast.success("Заменено", { id: tId });
          } catch { toast.error("Ошибка", { id: tId }); }
          setReplaceIndex(null);
        }}
      />

      <GalleryPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        items={previewItems}
        initialIndex={previewIndex}
      />
    </NodeViewWrapper>
  );
}
