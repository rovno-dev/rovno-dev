"use client"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import { fetchMe } from "@/entities/user/api/fetch-me"
import { getTokenExpiration } from "@/utils/get-token-expiration"
import { $fetch } from "@/utils/fetch"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"

interface UserContextType {
  user: any
  setUser: (user: any) => void
  token: string | null
  setToken: (token: string | null) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  // ── Session bootstrap ──────────────────────────────────────────────
  // Every path through `init` MUST end with `setIsLoading(false)`. If it
  // doesn't, `isLoading` stays true forever, `CheckUser`/`CheckNotUser`
  // both render null, and every gated page (including /register) blanks.
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const refresh_token = safeCookieStorage.getItem("refresh_token")
      const access_token = safeCookieStorage.getItem("access_token")

      if (!refresh_token || !access_token) {
        if (!cancelled) setIsLoading(false)
        return
      }

      const expTime = getTokenExpiration(access_token)
      const isExpired = expTime ? Date.now() >= expTime : true

      if (!isExpired) {
        if (!cancelled) setToken(access_token)
        return
      }

      // Access token expired — try the refresh token.
      // isToast: false — a stale refresh token is a normal state (logout,
      // deleted account, rotated secret). Toasting the backend's error
      // message on every page load is noise, not signal.
      let refreshed: string | null = null
      try {
        const response = await $fetch("/api/v1/refresh", {
          method: "POST",
          body: JSON.stringify({ refresh_token }),
          headers: { "Content-Type": "application/json" },
          isToast: false,
        })
        refreshed = response?.json?.access_token || null
      } catch {
        refreshed = null
      }

      if (cancelled) return

      if (refreshed) {
        safeCookieStorage.setItem("access_token", refreshed)
        setToken(refreshed)
        // isLoading stays true — `getUser` below will clear it.
      } else {
        // Refresh failed. Clear both cookies so we don't retry on every
        // navigation, and unblock the UI.
        safeCookieStorage.removeItem("access_token")
        safeCookieStorage.removeItem("refresh_token")
        setIsLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  // ── Fetch the user once we have a token ────────────────────────────
  const getUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const user_ = await fetchMe()
      setUser(user_)
      if (!user_) {
        // fetchMe already cleared the cookies on a 401. Drop the in-memory
        // token too so the app renders the signed-out state immediately
        // instead of holding a token that no longer works.
        setToken(null)
      }
    } catch (err) {
      // Never leave isLoading stuck true — that blanks the gated pages.
      console.error("[user-context] fetchMe failed:", err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auth side-effects. Runs whenever `token` changes.
  useEffect(() => {
    if (token) {
      safeCookieStorage.setItem("access_token", token)
      getUser()
    }
  }, [token, getUser])

  function clearAuth() {
    safeCookieStorage.removeItem("access_token")
    safeCookieStorage.removeItem("refresh_token")
    setToken(null)
    setUser(null)
    setIsLoading(false)
  }

  async function logout() {
    const refresh_token = safeCookieStorage.getItem("refresh_token")
    try {
      await $fetch("/api/v1/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
        headers: { "Content-Type": "application/json" },
        isToast: false,
      })
    } catch {
      /* best-effort — the local state is dropped regardless */
    }
    clearAuth()
    router.push("/login")
  }

  return (
    <UserContext.Provider
      value={{ user, setUser, token, setToken, isLoading, setIsLoading, logout }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
