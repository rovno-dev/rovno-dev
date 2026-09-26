"use client";
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CircleNotchIcon } from "@phosphor-icons/react";
import {
  createCatalogItem, updateCatalogItem,
  type CatalogItem, type CatalogName,
} from "@/utils/api/catalog";

const LANGS: { code: string; label: string; required?: boolean }[] = [
  { code: "en", label: "English", required: true },
  { code: "ru", label: "Русский" },
];

const TAG_KINDS = [
  { value: "tag", label: "Тег" },
  { value: "category", label: "Категория" },
  { value: "brand", label: "Бренд" },
];

interface Props {
  catalog: CatalogName;
  /** `null` opens in create mode. */
  item: CatalogItem | null;
  /** Controlled by the URL param in the parent. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  /** Only rendered for the tags catalog. */
  supportsKind?: boolean;
}

export function CatalogItemDialog({
  catalog, item, open, onOpenChange, onSaved, supportsKind,
}: Props) {
  const isEdit = !!item;
  const [labels, setLabels] = useState<Record<string, string>>({ en: "", ru: "" });
  const [kind, setKind] = useState("tag");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setLabels({ en: item.labels?.en || "", ru: item.labels?.ru || "" });
      setKind(item.kind || "tag");
    } else {
      setLabels({ en: "", ru: "" });
      setKind("tag");
    }
  }, [item, open]);

  const handleSave = async () => {
    if (!labels.en.trim()) {
      toast.error("English label обязателен");
      return;
    }
    setSaving(true);
    try {
      const cleanLabels: Record<string, string> = { en: labels.en.trim() };
      if (labels.ru?.trim()) cleanLabels.ru = labels.ru.trim();

      const payload: any = { labels: cleanLabels };
      if (supportsKind) payload.kind = kind;

      if (isEdit && item) {
        await updateCatalogItem(catalog, item.id, payload);
        toast.success("Обновлено");
      } else {
        await createCatalogItem(catalog, payload);
        toast.success("Создано");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать" : "Создать"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {LANGS.map((l) => (
            <Field key={l.code}>
              <FieldLabel>
                {l.label}
                {l.required && <span className="text-destructive ml-1">*</span>}
              </FieldLabel>
              <Input
                value={labels[l.code] || ""}
                onChange={(e) =>
                  setLabels((prev) => ({ ...prev, [l.code]: e.target.value }))
                }
                placeholder={l.required ? "Required" : "Необязательно"}
                autoFocus={l.code === "en"}
              />
            </Field>
          ))}

          {supportsKind && (
            <Field>
              <FieldLabel>Тип</FieldLabel>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAG_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {item?.code && (
            <div className="text-body-5 text-(--on-bg-low)">
              Код: <code className="font-mono">{item.code}</code>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outlined" onClick={() => onOpenChange(false)} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <CircleNotchIcon className="size-4 animate-spin" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
