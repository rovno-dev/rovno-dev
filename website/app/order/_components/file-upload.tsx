"use client"
import Image from "next/image";
import { CloudIcon, X, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileWithPreview {
  file: File;
  preview: string | null;
  id: string;
  type: string;
}

const AVALIABLE_FILE_TYPES = 'image/*, .pdf, .docx, .doc, .md, .mdx, .xls, .xlsx, .zip, .7zip';

export function FileUpload({
  attachments,
  onRemoveFile,
  onOpenLightbox,
  fileInputRef,
  onFileChange
}: {
  attachments: FileWithPreview[],
  onRemoveFile: (id: string) => void,
  onOpenLightbox: (idx: number) => void,
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">5. Доп. файлы (макс. 10мб.)</h3>
      <p className="text-(--on-bg-low)">Можно загрузить файлы с расширением {AVALIABLE_FILE_TYPES}.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {attachments.map((attr, idx) => (
          <div key={attr.id} className="relative aspect-square group rounded-2xl border border-(--outline) overflow-hidden bg-card transition-shadow hover:shadow-lg">
            <div className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4 relative" onClick={() => onOpenLightbox(idx)}>
              {attr.type === 'image' && attr.preview ? (
                <Image src={attr.preview} alt="preview" fill className="object-contain" />
              ) : (
                <>
                  <div className={cn("size-14 rounded-xl flex items-center justify-center mb-2", attr.type === 'pdf' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500")}><Newspaper className="size-8! fill-current" /></div>
                  <span className="text-[11px] font-semibold text-(--on-bg-medium) text-center line-clamp-2 px-1">{attr.file.name}</span>
                </>
              )}
            </div>
            <Button variant={'glass'} size={'icon-small'} onClick={(e) => { e.stopPropagation(); onRemoveFile(attr.id); }} className="absolute top-2 right-2 size-7 rounded-full"><X className="size-5!" /></Button>
          </div>
        ))}
        <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--outline) hover:border-(--primary) hover:bg-(--primary-glass) transition-all group">
          <CloudIcon className="size-6 [&>path]:text-(--dark-1)! group-hover:[&>path]:text-(--primary)!" /><span className="text-xs font-bold uppercase text-(--on-bg-low) group-hover:text-(--primary)">Добавить</span>
        </button>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={onFileChange} accept={AVALIABLE_FILE_TYPES} />
    </div>
  );
}
