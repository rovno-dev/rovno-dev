"use client";

import { createImageUpload } from "novel";
import { toast } from "sonner";

const onUpload = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/editor/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || "Не удалось загрузить изображение");
  }
  const data = await res.json();
  if (!data?.url) throw new Error("Сервер не вернул URL изображения");
  return data.url as string;
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("Можно загружать только изображения");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("Файл больше 20 МБ");
      return false;
    }
    return true;
  },
});
