"use client"
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const DEADLINE_OPTIONS = [
  { label: "Как можно скорее", value: "asap" },
  { label: "До 1 месяца", value: "under_1_month" },
  { label: "1–3 месяца", value: "1_3_months" },
  { label: "Не горит, обсуждаем", value: "flexible" },
];
const BUDGET_OPTIONS = [
  { label: "30 000–75 000 ₽", value: "30k_75k" },
  { label: "75 000–150 000 ₽", value: "75k_150k" },
  { label: "150 000–500 000 ₽", value: "150k_500k" },
  { label: "500 000–1 000 000 ₽", value: "500k_1kk" },
  { label: "Более 1 000 000 ₽", value: "over_1kk" },
  { label: "Нужна консультация по цене", value: "need_consultation" },
];
export function ProjectDetails({ error }: { error?: string }) {
  return (
    <div className="space-y-6">
      <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">
        3. О проекте
      </h3>
      <div className="space-y-4">

        <Field data-invalid={!!error}>
          <FieldLabel>Вкратце о проекте</FieldLabel>
          <Textarea name="description" className="min-h-[100px]" placeholder="Расскажите о целях проекта..." />
          <FieldError errors={error ? [{ message: error }] : []} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-3">
            <Label>Желаемые сроки</Label>
            <Select name="deadline">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите срок" />
              </SelectTrigger>
              <SelectContent>
                {DEADLINE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label>Ориентировочный бюджет</Label>
            <Select name="budget">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите бюджет" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
