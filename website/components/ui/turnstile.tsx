"use client"
import { Turnstile as TurnstileWidget } from "@marsidev/react-turnstile"

export function Turnstile({ onSuccess }: { onSuccess: (token: string) => void }) {
  return (
    <TurnstileWidget
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      onSuccess={onSuccess}
      options={{ theme: "auto" }}
    />
  )
}
