"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUser } from "@/entities/user/model/user-context"
import { rootDomainUrl, isAbsoluteUrl } from "@/utils/root-domain"

export function CheckUser({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser()
    const router = useRouter()
    useEffect(() => {
        if (isLoading || user) return
        toast.error("You are not authenticated")
        // LLM context: on app.* / admin.* a relative /login 404s (no route there).
        // Send the browser to the ROOT domain's /login and remember where we came
        // from via ?next=, so the login page can bounce back.
        const base = rootDomainUrl("/login")
        const current = typeof window !== "undefined" ? window.location.href : ""
        const target = current
            ? `${base}${base.includes("?") ? "&" : "?"}next=${encodeURIComponent(current)}`
            : base
        // Cross-origin navigation must go through window.location, not the
        // Next.js router (which only handles same-origin pushes).
        if (isAbsoluteUrl(target)) {
            window.location.replace(target)
        } else {
            router.replace(target)
        }
    }, [isLoading, user, router])
    if (isLoading || !user) return null
    return <>{children}</>
}
