"use client";

import { toast } from "sonner"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"

export interface FetchResult {
  response?: any
  json?: any
}

interface FetchOptions {
  method?: string
  body?: BodyInit | null
  isToast?: boolean
  headers?: Record<string, string>
  onLoadingChange?: (loading: boolean) => void
  /** Internal — prevents infinite refresh loops. Do not pass. */
  _retried?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// Auth endpoints: a 401 there is a real credential failure, not a stale
// session. Skip the refresh-and-retry dance for those.
const NO_RETRY = /\/login|\/register|\/verify|\/refresh|\/logout/

async function refreshAccessToken(): Promise<string | null> {
  const refresh_token = safeCookieStorage.getItem("refresh_token")
  if (!refresh_token) return null
  try {
    const res = await fetch(API_URL + "/api/v1/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const token = data?.access_token
    if (token) {
      safeCookieStorage.setItem("access_token", token)
      return token
    }
  } catch {
    /* network failure — fall through, caller sees the original 401 */
  }
  return null
}

export async function $fetch(
  route: string,
  { method = "GET", body = null, isToast = true, headers = {}, onLoadingChange, _retried = false }: FetchOptions = {}
): Promise<FetchResult> {
  // Build headers fresh each call so the retry picks up the refreshed token.
  const finalHeaders: Record<string, string> = { Accept: "application/json", ...headers }
  const token = safeCookieStorage.getItem("access_token")
  if (token) finalHeaders.Authorization = "Bearer " + token
  const url = API_URL + route

  let response = await fetch(url, { method, body, headers: finalHeaders })

  if (response.status === 401 && !_retried && !NO_RETRY.test(route)) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      // Recursive retry; the second call reads the just-written token.
      return $fetch(route, { method, body, isToast, headers, onLoadingChange, _retried: true })
    }
  }

  let json
  try {
    json = await response.json()
  } catch { /* empty body — leave json undefined */ }

  const message = json?.message
  if (message && isToast) {
    if (!response?.ok) toast.error(message)
    else toast.success(message)
  }
  await onLoadingChange?.(false)
  return { response, json }
}
