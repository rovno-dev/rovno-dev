"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export function CreateCompanyDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    website: "",
    industry: "",
    lifecycle_stage: "lead",
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Ошибка создания компании");
      }
      toast.success("Компания создана");
      setOpen(false);
      setForm({ name: "", website: "", industry: "", lifecycle_stage: "lead" });
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="filled" size="medium">
          <Plus className="size-4" />
          Добавить компанию
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать компанию</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Название *</FieldLabel>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Сайт</FieldLabel>
            <Input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Отрасль</FieldLabel>
            <Input
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Стадия жизненного цикла</FieldLabel>
            <Select
              value={form.lifecycle_stage}
              onValueChange={(val) => setForm({ ...form, lifecycle_stage: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Создание..." : "Создать"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
