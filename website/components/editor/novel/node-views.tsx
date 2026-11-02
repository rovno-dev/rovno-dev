"use client";
import { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Trash, Crop, Plus, ArrowsOutSimple, ArrowsInSimple, ImageSquare } from "@phosphor-icons/react";
import { ImageEditorDialog } from "../image-editor/image-editor-dialog";
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

// ── 1. Image Node View ──────────────────────────────────────────────────
export function ImageNodeView({ node, deleteNode, updateAttributes }: any) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const { src, alt } = node.attrs;

  return (
    <NodeViewWrapper className="relative group my-6 flex flex-col items-center w-full max-w-full">
      <div className="relative overflow-hidden rounded-sm border border-(--outline) max-w-full">
        <img src={src} alt={alt} className="w-full h-auto block max-h-[800px] object-contain" />
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-sm">
          <button type="button" onClick={() => setCropSrc(src)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-md backdrop-blur-sm" title="Обрезать">
            <Crop className="size-5" />
          </button>
          <button type="button" onClick={deleteNode} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-md backdrop-blur-sm" title="Удалить">
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

// ── 2. Video Node View ──────────────────────────────────────────────────
export function VideoNodeView({ node, deleteNode }: any) {
  const { src, poster } = node.attrs;
  return (
    <NodeViewWrapper className="relative group my-6 flex flex-col items-center w-full max-w-full">
      <div className="relative overflow-hidden rounded-sm border border-(--outline) w-full bg-black">
        <video src={src} poster={poster} controls className="w-full h-auto block" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={deleteNode} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-md backdrop-blur-sm" title="Удалить">
            <Trash className="size-4" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// ── 3. Gallery Node View ────────────────────────────────────────────────
export function GalleryNodeView({ node, deleteNode, updateAttributes }: any) {
  const { images = [], isFullWidth = false } = node.attrs;
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const handleRemove = (idx: number) => {
    const next = [...images];
    next.splice(idx, 1);
    updateAttributes({ images: next });
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
      for (const file of Array.from(input.files)) {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await $fetch("/api/v1/uploads/images", { method: "POST", body: fd, isToast: false });
          if (res?.json?.url) newImages.push(res.json.url);
        } catch (err) {}
      }
      updateAttributes({ images: newImages });
      toast.success("Добавлено", { id: tId });
    };
    input.click();
  };

  return (
    <NodeViewWrapper className="my-6 group/gallery w-full max-w-full">
      <div className={cn(
        "rounded-sm border border-(--outline) p-3 bg-(--bg)/30 transition-all w-full overflow-hidden", 
        isFullWidth ? "max-w-full" : "max-w-[800px] mx-auto"
      )}>
        
        <div className="flex items-center justify-between mb-3 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
          <span className="text-xs font-semibold text-(--on-bg-medium) uppercase tracking-wider">
            Галерея ({images.length})
          </span>
          <div className="flex gap-2">
            <button onClick={() => updateAttributes({ isFullWidth: !isFullWidth })} className="p-1.5 text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover) rounded-sm" title={isFullWidth ? "Обычная ширина" : "На всю ширину"}>
              {isFullWidth ? <ArrowsInSimple className="size-4" /> : <ArrowsOutSimple className="size-4" />}
            </button>
            <button onClick={deleteNode} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-sm" title="Удалить галерею">
              <Trash className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full">
          {images.map((img: string, i: number) => (
            <div key={i} className="relative group/img aspect-[4/3] rounded-sm overflow-hidden border border-(--outline) bg-black/20 w-full">
              <img src={img} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => setReplaceIndex(i)} className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md backdrop-blur-sm" title="Заменить">
                  <Crop className="size-4" />
                </button>
                <button onClick={() => handleRemove(i)} className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md backdrop-blur-sm" title="Удалить">
                  <Trash className="size-4" />
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={handleAdd} className="aspect-[4/3] rounded-sm border-2 border-dashed border-(--outline) flex flex-col items-center justify-center gap-2 text-(--on-bg-low) hover:text-(--primary) hover:border-(--primary) transition-colors bg-(--card)/50 w-full">
            <Plus className="size-6" />
            <span className="text-xs font-medium">Добавить</span>
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
    </NodeViewWrapper>
  );
}
