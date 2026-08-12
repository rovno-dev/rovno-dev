"use client"
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ContactInfo({ errors }: { errors: Record<string, string | undefined> }) {
  return (
    <div className="space-y-6">
      <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">5. Контакты</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field data-invalid={!!errors.user_name}>
          <FieldLabel>Ваше имя <span className="text-destructive">*</span></FieldLabel>
          <Input name="user_name" placeholder="Имя или никнейм" />
          <FieldError errors={errors.user_name ? [{ message: errors.user_name }] : []} />
        </Field>
        <Field data-invalid={!!errors.user_contact}>
          <FieldLabel>Телефон или Telegram <span className="text-destructive">*</span></FieldLabel>
          <Input name="user_contact" placeholder="@username или +7..." />
          <FieldError errors={errors.user_contact ? [{ message: errors.user_contact }] : []} />
        </Field>
        <Field data-invalid={!!errors.user_email}>
          <FieldLabel>Электронная почта <span className="text-destructive">*</span></FieldLabel>
          <Input name="user_email" type="email" placeholder="email@example.com" />
          <FieldError errors={errors.user_email ? [{ message: errors.user_email }] : []} />
        </Field>
      </div>
    </div>
  );
}
