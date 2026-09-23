"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Suspense, useState, useEffect } from "react"
import { $fetch } from "@/utils/fetch"
import { toast } from "sonner"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"
import { useUser } from "@/entities/user/model/user-context"
import { CheckNotUser } from "@/entities/user/model/check-not-user"
import { z } from "zod"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useLanguage } from "@/providers/language-provider"
import { Mail } from "lucide-react"
const verifySchema = z.object({
  code: z.string().length(6, "errors.code_length"),
})
function VerifyEmailInner() {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const searchParams = useSearchParams()
  const [errors, setErrors] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isResending, setIsResending] = useState<boolean>(false)
  const [formData, setFormData] = useState({ email: "", code: "" })
  const { setToken } = useUser()
  useEffect(() => {
    const email = searchParams.get("email")
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    } else {
      router.push("/register")
    }
  }, [searchParams, router])
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
        toast.error(response?.json?.detail || response?.json?.message || t("errors.verify_failed"))
        setIsLoading(false); return
      }
      const access_token = response?.json?.access_token
      const refresh_token = response?.json?.refresh_token
      if (refresh_token && access_token) {
        safeCookieStorage.setItem("access_token", access_token)
        safeCookieStorage.setItem("refresh_token", refresh_token)
        setToken(access_token)
        toast.success(t("errors.code_sent_again"))
        router.push("/")
      } else {
        toast.error(t("errors.tokens_missing"))
      }
    } catch (err) {
      toast.error(t("errors.connection"))
      setIsLoading(false)
    }
  }
  async function handleResend() {
    if (!formData.email) {
      toast.error(t("errors.email_not_specified"))
      return
    }
    setIsResending(true)
    try {
      const response = await $fetch("/api/v1/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, lang }),
        headers: { "Content-Type": "application/json" },
        onLoadingChange: setIsResending,
        isToast: false,
      })
      if (response?.response?.ok) {
        toast.success(t("errors.code_sent_again"))
      } else {
        const message = response?.json?.detail || response?.json?.message || t("errors.code_send_failed")
        toast.error(message)
      }
    } catch (err) {
      toast.error(t("errors.connection"))
    } finally {
      setIsResending(false)
    }
  }
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="serif-header text-4xl mb-2">{t("forms.verify.title")}</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {t("forms.verify.subtitle")}
          </p>
          {formData.email && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-(--outline) bg-(--card) px-3 py-1.5 text-xs font-medium text-(--on-bg-high)">
              <Mail className="size-3.5" />
              {formData.email}
            </p>
          )}
        </div>
        <div className="mb-6 flex gap-3 rounded-2xl border border-(--outline) bg-(--card) p-4">
          <span className="text-lg leading-none" aria-hidden>📬</span>
          <div className="space-y-1">
            <p className="text-body-4 font-medium text-(--on-bg-high)">{t("errors.code_check_spam")}</p>
            <p className="text-body-5 text-(--on-bg-medium) leading-relaxed">
              {t("errors.code_check_spam_hint")}
            </p>
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleVerify}>
          <input type="hidden" name="email" value={formData.email} />
          <Field>
            <FieldLabel>{t("forms.verify.code")}</FieldLabel>
            <Input
              type="text"
              name="code"
              placeholder={t("forms.verify.code_placeholder")}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <FieldError errors={errors?.code ? [{ message: t(errors.code) }] : []} />
          </Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Spinner className="size-4" />}
            {isLoading ? t("forms.verify.submitting") : t("forms.verify.submit")}
          </Button>
          <div className="flex flex-col gap-2 text-center text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center justify-center gap-2 text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              {isResending && <Spinner className="size-3.5" />}
              {isResending ? t("forms.verify.resending") : t("forms.verify.resend")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {t("forms.verify.back")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default function VerifyEmailPage() {
  return (
    <CheckNotUser>
      <Suspense fallback={null}>
        <VerifyEmailInner />
      </Suspense>
    </CheckNotUser>
  )
}
