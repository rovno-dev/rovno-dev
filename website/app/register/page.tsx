"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { $fetch } from "@/utils/fetch"
import { toast } from "sonner"
import { CheckNotUser } from "@/entities/user/model/check-not-user"
import { z } from "zod"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useLanguage } from "@/providers/language-provider"

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string()
    .min(8, "Пароль должен быть не короче 8 символов")
    .regex(/\d/, "Пароль должен содержать хотя бы одну цифру")
    .regex(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву"),
})

export default function RegisterPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [errors, setErrors] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [pageLoadTime, setPageLoadTime] = useState<number>(0)

  useEffect(() => {
    setPageLoadTime(Date.now())
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setErrors(null); setIsLoading(true)

    if (Date.now() - pageLoadTime < 3000) {
      toast.error("Пожалуйста, подождите немного перед отправкой")
      setIsLoading(false); return
    }

    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message
      })
      setErrors(fieldErrors); setIsLoading(false); return
    }

    try {
      const response = await $fetch("/api/v1/register/email", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          lang,
        }),
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
        } else if (detail) {
          toast.error(detail)
        }
        setIsLoading(false); return
      }

      if (!response?.response?.ok) {
        // ponytail: FastAPI HTTPException returns `detail`; `message` is only
        // set by the login endpoint's JSONResponse. Check both.
        const detail = response?.json?.detail || response?.json?.message || "Ошибка регистрации"
        toast.error(detail)
        setIsLoading(false); return
      }

      toast.success("Verification code sent to your email")
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      toast.error("Ошибка соединения. Проверьте интернет.")
      setIsLoading(false)
    }
  }

  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="serif-header text-4xl mb-2">Create Account</h1>
            <p className="text-[var(--text-secondary)] text-sm">Enter your email and password</p>
          </div>
          <form className="space-y-5" onSubmit={handleRegister}>
            <Field><FieldLabel>Email</FieldLabel><Input type="text" name="email" placeholder="Enter email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /><FieldError errors={errors?.email ? [{ message: errors.email }] : []} /></Field>
            <Field><FieldLabel>Password</FieldLabel><Input name="password" type="password" placeholder="Enter password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /><FieldError errors={errors?.password ? [{ message: errors.password }] : []} /></Field>
            <Button type="submit">Register</Button>
            <div className="text-center text-sm">
              <span className="text-[var(--text-secondary)]">Already have an account? </span>
              <Link href="/login" className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium transition-colors underline-offset-2 hover:underline">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </CheckNotUser>
  )
}
