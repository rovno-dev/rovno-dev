"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";
import { CheckNotUser } from "@/entities/user/model/check-not-user";
import { extractErrorMessage } from "@/lib/error-message";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      toast.error("Пароли не совпадают");
      return;
    }
    if (password.length < 8) {
      toast.error("Пароль должен быть не короче 8 символов");
      return;
    }

    setLoading(true);
    try {
      const res = await $fetch("/api/v1/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, new_password: password }),
        headers: { "Content-Type": "application/json" },
        isToast: false,
      });
      if (!res?.response?.ok) throw new Error(extractErrorMessage(res?.json));
      toast.success("Пароль успешно изменён");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      <Field>
        <FieldLabel>Код из письма</FieldLabel>
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={(v) => setCode(v)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </Field>
      <Field>
        <FieldLabel>Новый пароль</FieldLabel>
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </Field>
      <Field>
        <FieldLabel>Повторите пароль</FieldLabel>
        <PasswordInput value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required minLength={8} />
      </Field>
      <Button type="submit" disabled={loading || code.length !== 6 || !password || !passwordConfirm} className="w-full">
        {loading ? "Сохранение..." : "Сбросить пароль"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-display-3 mb-2">Новый пароль</h1>
            <p className="text-body-3 text-(--on-bg-medium)">Введите код из письма и новый пароль</p>
          </div>
          <Suspense fallback={<div>Загрузка...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </CheckNotUser>
  );
}
