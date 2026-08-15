"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { $fetch } from "@/utils/fetch"
import { toast } from "sonner"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"
import { useUser } from "@/entities/user/model/user-context"
import { CheckNotUser } from "@/entities/user/model/check-not-user"
import { z } from "zod"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"

const verifySchema = z.object({
  code: z.string().length(6, "Код должен состоять из 6 цифр"),
})

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errors, setErrors] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isResending, setIsResending] = useState<boolean>(false)
  const [formData, setFormData] = useState({ email: "", code: "" })
  const { setToken } = useUser()
  const autoResent = useRef(false)

  useEffect(() => {
    const email = searchParams.get("email")
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    } else {
      router.push("/register")
    }
  }, [searchParams, router])

  // Автоматическая отправка кода при открытии страницы (один раз)
  useEffect(() => {
    if (!formData.email || autoResent.current) return
    autoResent.current = true
    const timer = setTimeout(() => {
      handleResend()
    }, 500)
    return () => clearTimeout(timer)
  }, [formData.email])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setErrors(null); setIsLoading(true)
    const result = verifySchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
      })
      setErrors(fieldErrors); setIsLoading(false); return
    }
    try {
      const response = await $fetch("/api/v1/verify-email", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, code: formData.code }),
        headers: { "Content-Type": "application/json" },
        onLoadingChange: setIsLoading,
        isToast: false,
      })
      if (response?.response?.status === 422) {
        const detail = response?.json?.detail
        if (Array.isArray(detail)) {
          const fieldErrors: Record<string, string> = {}
          detail.forEach((err: any) => {
            const loc = err.loc
            if (loc && loc.length > 1) {
              const field = loc[1]
              fieldErrors[field] = err.msg
            }
          })
          setErrors(fieldErrors)
        } else if (detail) toast.error(detail)
        setIsLoading(false); return
      }
      if (!response?.response?.ok) {
        toast.error(response?.json?.message || "Ошибка верификации")
        setIsLoading(false); return
      }
      // Успех – сохраняем токены и входим
      const access_token = response?.json?.access_token
      const refresh_token = response?.json?.refresh_token
      if (refresh_token && access_token) {
        safeCookieStorage.setItem("access_token", access_token)
        safeCookieStorage.setItem("refresh_token", refresh_token)
        setToken(access_token)
        toast.success("Email подтверждён! Добро пожаловать.")
        router.push("/")
      } else {
        toast.error("Не удалось получить токены")
      }
    } catch (err) {
      toast.error("Ошибка соединения.")
      setIsLoading(false)
    }
  }

  async function handleResend() {
    if (!formData.email) {
      toast.error("Email не указан")
      return
    }
    setIsResending(true)
    try {
      const response = await $fetch("/api/v1/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
        headers: { "Content-Type": "application/json" },
        onLoadingChange: setIsResending,
        isToast: false,
      })
      if (response?.response?.ok) {
        toast.success("Код отправлен повторно! Проверьте почту.")
      } else {
        const message = response?.json?.message || "Не удалось отправить код"
        toast.error(message)
      }
    } catch (err) {
      toast.error("Ошибка соединения.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="serif-header text-4xl mb-2">Подтверждение email</h1>
            <p className="text-[var(--text-secondary)] text-sm">Введите код, отправленный на вашу почту</p>
          </div>
          <form className="space-y-5" onSubmit={handleVerify}>
            <input type="hidden" name="email" value={formData.email} />
            <Field>
              <FieldLabel>Код подтверждения</FieldLabel>
              <Input
                type="text"
                name="code"
                placeholder="6-значный код"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
              <FieldError errors={errors?.code ? [{ message: errors.code }] : []} />
            </Field>
            <Button type="submit">Подтвердить</Button>
            <div className="flex flex-col gap-2 text-center text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors"
              >
                {isResending ? "Отправка..." : "Отправить код повторно"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Назад к регистрации
              </button>
            </div>
          </form>
        </div>
      </div>
    </CheckNotUser>
  )
}
