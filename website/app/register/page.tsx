"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { $fetch } from "@/utils/fetch"
import { toast } from "sonner"
import { CheckNotUser } from "@/entities/user/model/check-not-user"
import { z } from "zod"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string()
    .min(8, "Пароль должен быть не короче 8 символов")
    .regex(/\d/, "Пароль должен содержать хотя бы одну цифру")
    .regex(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву"),
})
const verifySchema = z.object({
  code: z.string().length(6, "Код должен состоять из 6 цифр"),
})

export default function RegisterPage() {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [formData, setFormData] = useState({ email: "", password: "", code: "" })
  const [pageLoadTime, setPageLoadTime] = useState<number>(0)

  useEffect(() => {
    setPageLoadTime(Date.now())
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setErrors(null); setIsLoading(true)

    // Защита от ботов – проверка времени (форма отправлена не ранее чем через 3 секунды)
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
      if (!response?.response?.ok) {
        toast.error(response?.json?.message || "Ошибка регистрации")
        setIsLoading(false); return
      }
      if (response?.response?.ok) {
        toast.success("Verification code sent to your email")
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        toast.error("Не удалось отправить код")
      }
    } catch (err) {
      toast.error("Ошибка соединения. Проверьте интернет.")
      setIsLoading(false)
    }
  }

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
      if (response?.response?.ok) {
        toast.success("Email verified! You can now log in.")
        router.push("/login")
      } else {
        toast.error("Не удалось верифицировать email")
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
            <h1 className="serif-header text-4xl mb-2">Create Account</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {step === 'register' ? 'Enter your email and password' : 'Enter the code sent to your email'}
            </p>
          </div>
          {step === 'register' ? (
            <form className="space-y-5" onSubmit={handleRegister}>
              <Field><FieldLabel>Email</FieldLabel><Input type="text" name="email" placeholder="Enter email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /><FieldError errors={errors?.email ? [{ message: errors.email }] : []} /></Field>
              <Field><FieldLabel>Password</FieldLabel><Input name="password" type="password" placeholder="Enter password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /><FieldError errors={errors?.password ? [{ message: errors.password }] : []} /></Field>
              <Button type="submit">Register</Button>
              <div className="text-center text-sm">
                <span className="text-[var(--text-secondary)]">Already have an account? </span>
                <Link href="/login" className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium transition-colors underline-offset-2 hover:underline">Sign In</Link>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerify}>
              <Field><FieldLabel>Verification Code</FieldLabel><Input type="text" name="code" placeholder="6-digit code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /><FieldError errors={errors?.code ? [{ message: errors.code }] : []} /></Field>
              <Button type="submit">Verify</Button>
              <div className="text-center text-sm">
                <button type="button" onClick={() => setStep('register')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Back</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </CheckNotUser>
  )
}
