"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useState, useEffect } from "react"
import { $fetch } from "@/utils/fetch"
import { toast } from "sonner"
import { CheckNotUser } from "@/entities/user/model/check-not-user"
import { z } from "zod"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useLanguage } from "@/providers/language-provider"
const registerSchema = z.object({
  email: z.string().email("errors.email_invalid"),
  password: z.string()
    .min(8, "errors.password_too_short")
    .regex(/\d/, "errors.password_needs_digit")
    .regex(/[A-Z]/, "errors.password_needs_upper"),
})
export default function RegisterPage() {
  const router = useRouter()
  const { t, lang } = useLanguage()
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
      toast.error(t("errors.bot_too_fast"))
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
        const detail = response?.json?.detail || response?.json?.message || t("errors.register_failed")
        toast.error(detail)
        setIsLoading(false); return
      }
      toast.success(t("errors.code_sent"), { duration: 5000 })
      toast.info(t("errors.code_check_spam"), {
        duration: 8000,
        description: t("errors.code_check_spam_hint"),
      })
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      toast.error(t("errors.connection"))
      setIsLoading(false)
    }
  }
  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="serif-header text-4xl mb-2">{t("forms.register.title")}</h1>
            <p className="text-[var(--text-secondary)] text-sm">{t("forms.register.subtitle")}</p>
          </div>
          <form className="space-y-5" onSubmit={handleRegister}>
            <Field>
              <FieldLabel>{t("forms.email")}</FieldLabel>
              <Input type="text" name="email" placeholder={t("forms.email_placeholder")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <FieldError errors={errors?.email ? [{ message: t(errors.email) }] : []} />
            </Field>
            <Field>
              <FieldLabel>{t("forms.password")}</FieldLabel>
              <Input name="password" type="password" placeholder={t("forms.password_placeholder")} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              <FieldError errors={errors?.password ? [{ message: t(errors.password) }] : []} />
            </Field>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Spinner className="size-4" />}
              {isLoading ? t("forms.register.submitting") : t("forms.register.submit")}
            </Button>
            <div className="text-center text-sm">
              <span className="text-[var(--text-secondary)]">{t("forms.register.have_account")} </span>
              <Link href="/login" className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium transition-colors underline-offset-2 hover:underline">{t("forms.register.login_link")}</Link>
            </div>
          </form>
        </div>
      </div>
    </CheckNotUser>
  )
}
