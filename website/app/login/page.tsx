"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { $fetch } from "@/utils/fetch"
import { toast } from "sonner"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"
import { CheckNotUser } from "@/entities/user/model/check-not-user"
import { useUser } from "@/entities/user/model/user-context"
import { z } from "zod"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
})

export default function LoginPage() {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const { setToken } = useUser()
  const [pageLoadTime, setPageLoadTime] = useState<number>(0)

  useEffect(() => {
    setPageLoadTime(Date.now())
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors(null); setIsLoading(true)

    // Защита от ботов – проверка времени
    if (Date.now() - pageLoadTime < 3000) {
      toast.error("Пожалуйста, подождите немного перед отправкой")
      setIsLoading(false); return
    }

    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
      })
      setErrors(fieldErrors); setIsLoading(false); return
    }

    try {
      const response = await $fetch("/api/v1/login/email", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, password: formData.password }),
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
      if (response?.response?.status === 403) {
        const message = response?.json?.message
        if (message === "User not verified") {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
          return
        }
        toast.error(message || "Доступ запрещён")
        setIsLoading(false); return
      }
      if (!response?.response?.ok) {
        toast.error(response?.json?.message || "Ошибка при входе")
        setIsLoading(false); return
      }
      const access_token = response?.json?.access_token
      const refresh_token = response?.json?.refresh_token
      if (refresh_token && access_token) {
        safeCookieStorage.setItem("access_token", access_token)
        safeCookieStorage.setItem("refresh_token", refresh_token)
        setToken(access_token)
        toast.success("Welcome back!")
        router.push("/")
      } else {
        toast.error("Не удалось получить токены")
      }
    } catch (err) {
      toast.error("Ошибка соединения.")
      setIsLoading(false)
    }
  }

  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="serif-header text-4xl mb-2">Welcome</h1>
            <p className="text-[var(--text-secondary)] text-sm">Sign in to your account</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field><FieldLabel>Email</FieldLabel><Input type="text" name="email" placeholder="Enter email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /><FieldError errors={errors?.email ? [{ message: errors.email }] : []} /></Field>
            <Field><FieldLabel>Password</FieldLabel><Input name="password" type="password" placeholder="Enter password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /><FieldError errors={errors?.password ? [{ message: errors.password }] : []} /></Field>
            <Button type="submit">Sign In</Button>
            <div className="text-center text-sm">
              <span className="text-[var(--text-secondary)]">No account? </span>
              <Link href="/register" className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium transition-colors underline-offset-2 hover:underline">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </CheckNotUser>
  )
}
