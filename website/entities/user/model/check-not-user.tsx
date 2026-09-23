"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/entities/user/model/user-context"
import { rootDomainUrl, isAbsoluteUrl } from "@/utils/root-domain"

export function CheckNotUser({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser()
    const router = useRouter()
    useEffect(() => {
        if (isLoading || !user) return
        // Same cross-subdomain reasoning as CheckUser: relative "/" would stay
        // on the subdomain. Send authenticated users to the root.
        const target = rootDomainUrl("/")
        if (isAbsoluteUrl(target)) {
            window.location.replace(target)
        } else {
            router.replace(target)
        }
    }, [isLoading, user, router])
    if (isLoading || user) return null
    return <>{children}</>
}
