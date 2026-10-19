"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";
import { CheckNotUser } from "@/entities/user/model/check-not-user";
import { useLanguage } from "@/providers/language-provider";
import { extractErrorMessage } from "@/lib/error-message";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await $fetch("/api/v1/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email, lang }),
        headers: { "Content-Type": "application/json" },
        isToast: false,
      });
      if (!res?.response?.ok) throw new Error(extractErrorMessage(res?.json));
      toast.success("Код отправлен на почту");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-display-3 mb-2">Восстановление пароля</h1>
            <p className="text-body-3 text-(--on-bg-medium)">Введите email, указанный при регистрации</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Отправка..." : "Отправить код"}
            </Button>
            <div className="text-center text-sm">
              <Link href="/login" className="text-(--primary) hover:underline">Вернуться ко входу</Link>
            </div>
          </form>
        </div>
      </div>
    </CheckNotUser>
  );
}
